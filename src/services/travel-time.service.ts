/**
 * QueueLess — Travel Time & Arrival Estimator (TypeScript)
 * 
 * PRIVACY GUARANTEE:
 * Requests device GPS coordinate ONCE solely to calculate transit/driving travel duration
 * to the service venue or counter desk.
 * NO continuous tracking. NO background location monitoring. NO storage on remote servers.
 */

import { TravelTimeEstimate } from '../types/queue.types';

// Default Venue Coordinates: Central Administration Complex
const DEFAULT_VENUE_LAT = 28.6139; // e.g. New Delhi / Central Hub
const DEFAULT_VENUE_LNG = 77.2090;

export class TravelTimeService {

  private venueLat: number;
  private venueLng: number;

  constructor(venueLat = DEFAULT_VENUE_LAT, venueLng = DEFAULT_VENUE_LNG) {
    this.venueLat = venueLat;
    this.venueLng = venueLng;
  }

  /**
   * Request one-time location permission solely to estimate travel time
   */
  public async requestTravelTimeEstimate(targetSlotTime?: string): Promise<TravelTimeEstimate> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          const estimate = this.computeEstimate(uLat, uLng, targetSlotTime);
          resolve(estimate);
        },
        (error) => {
          // Fallback to simulated nearby estimate (1.8 km / ~8 mins) if user denies permission
          console.warn('Geolocation permission declined or unavailable. Using estimated proximity.', error.message);
          const fallback = this.computeEstimate(this.venueLat + 0.015, this.venueLng + 0.015, targetSlotTime);
          fallback.statusText = 'Simulated Estimate (Location Permission Not Granted)';
          resolve(fallback);
        },
        {
          enableHighAccuracy: false, // Fast, low power
          timeout: 8000,
          maximumAge: 300000 // Cache for 5 mins so no redundant requests
        }
      );
    });
  }

  /**
   * Calculate distance using Haversine formula and compute transit time
   */
  public computeEstimate(uLat: number, uLng: number, targetSlotTime?: string): TravelTimeEstimate {
    const distanceKm = this.haversineDistance(uLat, uLng, this.venueLat, this.venueLng);

    // Urban speeds: Driving ~25 km/h + 3 min parking buffer; Transit ~18 km/h; Walking ~4.5 km/h
    const drivingMinutes = Math.max(3, Math.round((distanceKm / 25) * 60) + 3);
    const transitMinutes = Math.max(5, Math.round((distanceKm / 18) * 60) + 5);
    const walkingMinutes = Math.round((distanceKm / 4.5) * 60);

    const isWithinProximity = distanceKm < 0.5; // Under 500m

    // Calculate Recommended Departure Time
    const now = new Date();
    let departureDate = new Date(now.getTime());

    if (targetSlotTime) {
      // Parse slot time e.g. "11:30 AM"
      const parts = targetSlotTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (parts) {
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        const ampm = parts[3] ? parts[3].toUpperCase() : '';
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;

        const slotDate = new Date();
        slotDate.setHours(h, m, 0, 0);

        // Leave drivingMinutes + 5 min safety buffer before slot
        const leaveTimeMs = slotDate.getTime() - (drivingMinutes + 5) * 60000;
        departureDate = new Date(leaveTimeMs);
      }
    } else {
      // Immediate departure recommended
      departureDate = new Date(now.getTime());
    }

    const departureTimeString = departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let statusText = `${distanceKm.toFixed(1)} km away (~${drivingMinutes} min drive)`;
    if (isWithinProximity) {
      statusText = 'You are already near the venue (< 500m). Proceed directly to counter.';
    }

    return {
      userLatitude: uLat,
      userLongitude: uLng,
      venueLatitude: this.venueLat,
      venueLongitude: this.venueLng,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      drivingMinutes,
      transitMinutes,
      walkingMinutes,
      recommendedDepartureTime: departureTimeString,
      isWithinProximity,
      statusText,
      privacyDisclaimer: '🔒 Location was used once to calculate transit time. It is never tracked or saved.'
    };
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
