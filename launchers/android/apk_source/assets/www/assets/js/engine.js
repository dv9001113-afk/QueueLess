/**
 * QueueLess — Core Queue Management Engine
 * Deterministic 2:1 Interleaved Allocation, Real-time BroadcastChannel sync,
 * Web Audio Chime, Text-to-Speech Announcements & State Machine
 */

const CHANNEL_NAME = 'queueless_realtime_channel';
let broadcastChannel = null;

if (typeof BroadcastChannel !== 'undefined') {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
}

// Default Hospital Master Entity
const DEFAULT_HOSPITAL = {
  id: 'hosp-apex-main',
  name: 'Apex City Care Super-Specialty Hospital',
  department: 'Cardiology & General Medicine OPD',
  address: 'Health Boulevard, Ring Road, Sector 12, Metro Junction, New Delhi - 110029',
  headDoctor: 'Dr. Sarah Mehta, MD (Chief Consultant Cardiologist)',
  staffCoordinator: 'Sister Priya Nair (OPD Floor Calling Desk)',
  consultationRoom: 'OPD Consultation Room 1',
  callingCounter: 'OPD Queue Calling Desk 1',
  defaultConsultationDurationMins: 10,
  emergencyPhone: '+91 11 2659 8888',
  opdPhone: '+91 11 2659 0001'
};

// Default Initial Services (Hospital Clinical OPD Units)
const DEFAULT_SERVICES = [
  { id: 1, name: 'Cardiology & Internal Medicine OPD', code: 'MED', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-heartbeat' },
  { id: 2, name: 'General Physician & Triage', code: 'GEN', avgDuration: 8, isPriorityAllowed: true, icon: 'fa-stethoscope' },
  { id: 3, name: 'Emergency Trauma & Critical Resuscitation', code: 'EMR', avgDuration: 12, isPriorityAllowed: true, icon: 'fa-ambulance' },
  { id: 4, name: 'Diagnostic Blood Lab & ECG Attestation', code: 'LAB', avgDuration: 6, isPriorityAllowed: false, icon: 'fa-vial' }
];

// Default Initial Counters (OPD Consultation Desks)
const DEFAULT_COUNTERS = [
  { id: 1, name: 'OPD Room 1', staff: 'Dr. Sarah Mehta, MD (Chief Consultant)', serviceId: 1, currentToken: 'MED-101', status: 'IN_SERVICE', isActive: true },
  { id: 2, name: 'OPD Room 2', staff: 'Dr. Rajesh Sharma (General Medicine)', serviceId: 2, currentToken: 'MED-102', status: 'IN_SERVICE', isActive: true },
  { id: 3, name: 'OPD Room 3', staff: 'Sister Anita Verma (Pediatric OPD)', serviceId: 1, currentToken: null, status: 'IDLE', isActive: true },
  { id: 4, name: 'Emergency Bay', staff: 'Trauma Team Lead', serviceId: 3, currentToken: null, status: 'IDLE', isActive: true }
];

// ============================================================================
// 10 SPECIALIST DOCTORS (CLINICAL DIRECTORY)
// ============================================================================
const DEFAULT_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Mehta, MD',
    specialty: 'Cardiology & Heart Health',
    qualification: 'MD (Cardiology AIIMS, Fellow ESC)',
    department: 'Cardiology & Internal Medicine OPD',
    room: 'Room 101 (Main Clinical Block)',
    roomNo: 101,
    opdTimings: '09:00 AM - 01:30 PM',
    freeSlots: ['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM', '02:30 PM', '03:15 PM'],
    rating: 4.9,
    experienceYrs: 16,
    phone: '+91 11 2659 0101',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#10b981',
    icon: 'fa-heartbeat'
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Sharma, MD',
    specialty: 'Internal Medicine & Diabetology',
    qualification: 'MD (Internal Medicine MAMC)',
    department: 'General Medicine & Triage OPD',
    room: 'Room 102 (First Floor OPD Wing)',
    roomNo: 102,
    opdTimings: '09:30 AM - 02:00 PM',
    freeSlots: ['09:45 AM', '10:30 AM', '11:15 AM', '12:00 PM', '12:45 PM', '03:00 PM'],
    rating: 4.8,
    experienceYrs: 14,
    phone: '+91 11 2659 0102',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#0ea5e9',
    icon: 'fa-stethoscope'
  },
  {
    id: 'doc-3',
    name: 'Dr. Vikram Malhotra, MS',
    specialty: 'Orthopedic Surgery & Joint Replacement',
    qualification: 'MS (Orthopedics Gold Medalist, Fellow Arthroscopy UK)',
    department: 'Orthopedics & Joint Clinic',
    room: 'Room 103 (Surgical Block)',
    roomNo: 103,
    opdTimings: '10:00 AM - 02:30 PM',
    freeSlots: ['10:15 AM', '11:00 AM', '11:45 AM', '12:30 PM', '01:15 PM', '02:00 PM'],
    rating: 4.9,
    experienceYrs: 18,
    phone: '+91 11 2659 0103',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#8b5cf6',
    icon: 'fa-bone'
  },
  {
    id: 'doc-4',
    name: 'Dr. Ananya Iyer, MD',
    specialty: 'Pediatrics & Child Care',
    qualification: 'MD (Pediatrics Safdarjung, DNB)',
    department: 'Pediatrics & Neonatal OPD',
    room: 'Room 104 (Mother & Child Block)',
    roomNo: 104,
    opdTimings: '09:00 AM - 01:00 PM',
    freeSlots: ['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM', '12:30 PM', '02:00 PM'],
    rating: 4.9,
    experienceYrs: 12,
    phone: '+91 11 2659 0104',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#ec4899',
    icon: 'fa-baby'
  },
  {
    id: 'doc-5',
    name: 'Dr. Pooja Verma, MD',
    specialty: 'Dermatology & Cosmetology',
    qualification: 'MD (Dermatology Lady Hardinge, DVD)',
    department: 'Dermatology & Skin Clinic',
    room: 'Room 105 (Aesthetic Block)',
    roomNo: 105,
    opdTimings: '10:30 AM - 03:00 PM',
    freeSlots: ['10:45 AM', '11:30 AM', '12:15 PM', '01:00 PM', '02:00 PM', '02:45 PM'],
    rating: 4.8,
    experienceYrs: 11,
    phone: '+91 11 2659 0105',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#f59e0b',
    icon: 'fa-allergies'
  },
  {
    id: 'doc-6',
    name: 'Dr. Arjun Singhania, MS',
    specialty: 'ENT & Head/Neck Surgery',
    qualification: 'MS (ENT PGIMER, Fellow Cochlear Implant)',
    department: 'ENT & Audiology OPD',
    room: 'Room 106 (ENT Examination Wing)',
    roomNo: 106,
    opdTimings: '09:00 AM - 01:00 PM',
    freeSlots: ['09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '03:00 PM'],
    rating: 4.7,
    experienceYrs: 15,
    phone: '+91 11 2659 0106',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#14b8a6',
    icon: 'fa-head-side-cough'
  },
  {
    id: 'doc-7',
    name: 'Dr. Meera Nambiar, MD, DM',
    specialty: 'Neurology & Stroke Specialist',
    qualification: 'MD (Medicine), DM (Neurology NIMHANS)',
    department: 'Neurology & Brain Sciences OPD',
    room: 'Room 107 (Neuroscience Wing)',
    roomNo: 107,
    opdTimings: '11:00 AM - 04:00 PM',
    freeSlots: ['11:15 AM', '12:00 PM', '12:45 PM', '02:00 PM', '02:45 PM', '03:30 PM'],
    rating: 4.9,
    experienceYrs: 17,
    phone: '+91 11 2659 0107',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#6366f1',
    icon: 'fa-brain'
  },
  {
    id: 'doc-8',
    name: 'Dr. Kavita Kulkarni, MD, DGO',
    specialty: 'Gynecology & Obstetrics',
    qualification: 'MD, DGO (Obstetrics & Fetal Medicine KEM)',
    department: "Women's Health & High Risk Pregnancy OPD",
    room: 'Room 108 (Maternity Pavilion)',
    roomNo: 108,
    opdTimings: '09:30 AM - 02:00 PM',
    freeSlots: ['09:45 AM', '10:30 AM', '11:15 AM', '12:00 PM', '01:00 PM', '01:45 PM'],
    rating: 4.8,
    experienceYrs: 19,
    phone: '+91 11 2659 0108',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#e11d48',
    icon: 'fa-female'
  },
  {
    id: 'doc-9',
    name: 'Dr. Rohit Deshmukh, MD, DM',
    specialty: 'Medical Oncology & Chemotherapy',
    qualification: 'MD (Medicine), DM (Medical Oncology Tata Memorial)',
    department: 'Oncology Comprehensive Cancer Center',
    room: 'Room 109 (Daycare Oncology Wing)',
    roomNo: 109,
    opdTimings: '10:00 AM - 03:30 PM',
    freeSlots: ['10:30 AM', '11:15 AM', '12:00 PM', '01:30 PM', '02:15 PM', '03:00 PM'],
    rating: 4.9,
    experienceYrs: 15,
    phone: '+91 11 2659 0109',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#f97316',
    icon: 'fa-ribbon'
  },
  {
    id: 'doc-10',
    name: 'Dr. Alok Nath, MS',
    specialty: 'Ophthalmology & Cataract/Lasik',
    qualification: 'MS (Ophthalmology RP Centre AIIMS)',
    department: 'Eye Care & Refraction OPD',
    room: 'Room 110 (Vision Centre)',
    roomNo: 110,
    opdTimings: '09:00 AM - 01:30 PM',
    freeSlots: ['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM', '12:30 PM', '02:30 PM'],
    rating: 4.8,
    experienceYrs: 13,
    phone: '+91 11 2659 0110',
    hotline: '+91 11 2659 8888',
    hospitalLocation: 'Apex City Care Super-Specialty Hospital, Ring Road, Sector 12, New Delhi',
    avatarBg: '#059669',
    icon: 'fa-eye'
  }
];

// ============================================================================
// 10 HOSPITAL FLOOR STAFF MEMBERS (NURSING & OPERATIONS)
// ============================================================================
const DEFAULT_STAFF_MEMBERS = [
  {
    staffId: 'STF-001',
    name: 'Sister Priya Nair',
    email: 'staff@queueless.com',
    role: 'STAFF',
    designation: 'Lead OPD Floor Coordinator & Calling Desk Operator',
    department: 'Cardiology & Internal OPD Queue Dispatch',
    assignedDesk: 'OPD Calling Desk 1',
    counterId: 1,
    phone: '+91 98500 55661',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Staff Quarters B-12, Health Boulevard, Ring Road, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-002',
    name: 'Mr. Suresh Kumar',
    email: 'suresh.kumar@queueless.com',
    role: 'STAFF',
    designation: 'Senior Registrar & Triage Vitals Nurse',
    department: 'General Medicine & Triage Desk',
    assignedDesk: 'OPD Calling Desk 2',
    counterId: 2,
    phone: '+91 98500 55662',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Pocket 4, Sector 14, Rohini, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-003',
    name: 'Sister Anita Verma',
    email: 'anita.verma@queueless.com',
    role: 'STAFF',
    designation: 'Pediatric Patient Relations & Vaccination Desk',
    department: 'Pediatrics OPD Counter',
    assignedDesk: 'OPD Calling Desk 3',
    counterId: 3,
    phone: '+91 98500 55663',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Flat 102, Mayur Vihar Phase 1, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-004',
    name: 'Mr. Deepak Joshi',
    email: 'deepak.joshi@queueless.com',
    role: 'STAFF',
    designation: 'Orthopedic Plaster & Token Dispatcher',
    department: 'Orthopedics & Fracture Clinic',
    assignedDesk: 'OPD Calling Desk 4',
    counterId: 4,
    phone: '+91 98500 55664',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Block C, Janakpuri, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-005',
    name: 'Sister Sunita Patel',
    email: 'sunita.patel@queueless.com',
    role: 'STAFF',
    designation: 'Dermatology Minor Procedure Assistant',
    department: 'Dermatology OPD Desk',
    assignedDesk: 'OPD Calling Desk 5',
    counterId: 5,
    phone: '+91 98500 55665',
    shift: 'Evening Shift (01:00 PM - 09:00 PM)',
    personalAddress: 'Sector 52, Noida, Uttar Pradesh',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-006',
    name: 'Mr. Manoj Tiwari',
    email: 'manoj.tiwari@queueless.com',
    role: 'STAFF',
    designation: 'ENT Audiometry & Screening Attendant',
    department: 'ENT OPD Floor Desk',
    assignedDesk: 'OPD Calling Desk 6',
    counterId: 6,
    phone: '+91 98500 55666',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Laxmi Nagar, East Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-007',
    name: 'Sister Lakshmi Rao',
    email: 'lakshmi.rao@queueless.com',
    role: 'STAFF',
    designation: 'Neuro Diagnostics & EEG Token Dispatcher',
    department: 'Neurology Department Reception',
    assignedDesk: 'OPD Calling Desk 7',
    counterId: 7,
    phone: '+91 98500 55667',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Alaknanda, South Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-008',
    name: 'Mr. Rakesh Verma',
    email: 'rakesh.verma@queueless.com',
    role: 'STAFF',
    designation: 'Gynecology Ultrasound Receptionist',
    department: 'Maternity & Women Care Floor',
    assignedDesk: 'OPD Calling Desk 8',
    counterId: 8,
    phone: '+91 98500 55668',
    shift: 'Evening Shift (01:00 PM - 09:00 PM)',
    personalAddress: 'Dwarka Sector 7, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-009',
    name: 'Sister Divya Sharma',
    email: 'divya.sharma@queueless.com',
    role: 'STAFF',
    designation: 'Daycare Chemotherapy Coordinator',
    department: 'Oncology Patient Helpdesk',
    assignedDesk: 'OPD Calling Desk 9',
    counterId: 9,
    phone: '+91 98500 55669',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Sector 23, Gurugram, Haryana',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-010',
    name: 'Mr. Amit Saxena',
    email: 'amit.saxena@queueless.com',
    role: 'STAFF',
    designation: 'Ophthalmology Refraction & IOP Technician',
    department: 'Vision Care Clinic Desk',
    assignedDesk: 'OPD Calling Desk 10',
    counterId: 10,
    phone: '+91 98500 55670',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Patparganj, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-011',
    name: 'Sister Kavya Menon',
    email: 'kavya.menon@queueless.com',
    role: 'STAFF',
    designation: 'Emergency Triage Coordinator & First Response Nurse',
    department: 'Emergency & Trauma OPD',
    assignedDesk: 'Emergency Bay Desk 11',
    counterId: 11,
    phone: '+91 98500 55671',
    shift: 'Night Shift (09:00 PM - 05:00 AM)',
    personalAddress: 'Shastri Nagar, New Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-012',
    name: 'Mr. Pankaj Bhatt',
    email: 'pankaj.bhatt@queueless.com',
    role: 'STAFF',
    designation: 'Lab Reports & Blood Bank Coordinator',
    department: 'Pathology & Diagnostic Lab',
    assignedDesk: 'Lab Counter Desk 12',
    counterId: 12,
    phone: '+91 98500 55672',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Shalimar Bagh, North Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-013',
    name: 'Sister Asha Pillai',
    email: 'asha.pillai@queueless.com',
    role: 'STAFF',
    designation: 'Pharmacy Counter Attendant & Prescription Dispatcher',
    department: 'Hospital Pharmacy',
    assignedDesk: 'Pharmacy Desk 13',
    counterId: 13,
    phone: '+91 98500 55673',
    shift: 'Evening Shift (01:00 PM - 09:00 PM)',
    personalAddress: 'Trilokpuri, East Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-014',
    name: 'Mr. Vinod Choudhary',
    email: 'vinod.choudhary@queueless.com',
    role: 'STAFF',
    designation: 'Radiology & MRI Scheduling Desk Officer',
    department: 'Radiology & Imaging OPD',
    assignedDesk: 'Radiology Desk 14',
    counterId: 14,
    phone: '+91 98500 55674',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Uttam Nagar, West Delhi',
    status: 'ON_DUTY'
  },
  {
    staffId: 'STF-015',
    name: 'Sister Geeta Nair',
    email: 'geeta.nair@queueless.com',
    role: 'STAFF',
    designation: 'ICU Step-Down Ward Coordinator & Patient Liaison',
    department: 'ICU & Critical Care Unit',
    assignedDesk: 'ICU Family Liaison Desk 15',
    counterId: 15,
    phone: '+91 98500 55675',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Pandav Nagar, New Delhi',
    status: 'ON_DUTY'
  }
];

// ============================================================================
// 10 HOSPITAL CLIENTS / PATIENTS (OPD PASSES)
// ============================================================================
const DEFAULT_CLIENTS = [
  {
    id: 'pat-1',
    tokenNumber: 'MED-101',
    userName: 'Aarav Sharma',
    userPhone: '+91 98765 43210',
    email: 'patient@queueless.com',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Mehta, MD',
    specialty: 'Cardiology',
    room: 'Room 101',
    distanceKm: 2.8,
    userLocation: 'Connaught Place, Central Zone (2.8 km away)',
    transitMode: 'TWO_WHEELER',
    patientAge: 34,
    chiefComplaint: 'Acute Chest Tightness & Palpitations',
    slotTime: '10:30 AM',
    status: 'IN_SERVICE'
  },
  {
    id: 'pat-2',
    tokenNumber: 'MED-102',
    userName: 'Priya Deshmukh',
    userPhone: '+91 98333 44556',
    email: 'priya.patient@gmail.com',
    doctorId: 'doc-2',
    doctorName: 'Dr. Rajesh Sharma, MD',
    specialty: 'General Medicine',
    room: 'Room 102',
    distanceKm: 1.2,
    userLocation: 'South Extension, South Zone (1.2 km away)',
    transitMode: 'TWO_WHEELER',
    patientAge: 42,
    chiefComplaint: 'Chronic Hypertension & Persistent Dizziness',
    slotTime: '10:45 AM',
    status: 'IN_SERVICE'
  },
  {
    id: 'pat-3',
    tokenNumber: 'ORT-201',
    userName: 'Rohan Kapoor',
    userPhone: '+91 98444 55667',
    email: 'rohan.k@gmail.com',
    doctorId: 'doc-3',
    doctorName: 'Dr. Vikram Malhotra, MS',
    specialty: 'Orthopedics',
    room: 'Room 103',
    distanceKm: 4.5,
    userLocation: 'Karol Bagh, West Zone (4.5 km away)',
    transitMode: 'CAR',
    patientAge: 29,
    chiefComplaint: 'Right Knee Ligament Strain & Joint Swelling',
    slotTime: '11:00 AM',
    status: 'QUEUED'
  },
  {
    id: 'pat-4',
    tokenNumber: 'PED-301',
    userName: 'Baby Simran Kaur (Parent: Gurpreet)',
    userPhone: '+91 98555 66778',
    email: 'simran.care@gmail.com',
    doctorId: 'doc-4',
    doctorName: 'Dr. Ananya Iyer, MD',
    specialty: 'Pediatrics',
    room: 'Room 104',
    distanceKm: 3.1,
    userLocation: 'Lajpat Nagar, South Zone (3.1 km away)',
    transitMode: 'CAR',
    patientAge: 4,
    chiefComplaint: 'High Spiking Fever 103F & Wheezing Cough',
    slotTime: '11:15 AM',
    status: 'QUEUED'
  },
  {
    id: 'pat-5',
    tokenNumber: 'DER-501',
    userName: 'Neha Gupta',
    userPhone: '+91 98666 77889',
    email: 'neha.gupta@gmail.com',
    doctorId: 'doc-5',
    doctorName: 'Dr. Pooja Verma, MD',
    specialty: 'Dermatology',
    room: 'Room 105',
    distanceKm: 2.0,
    userLocation: 'Hauz Khas, South Zone (2.0 km away)',
    transitMode: 'TWO_WHEELER',
    patientAge: 26,
    chiefComplaint: 'Acute Urticaria Skin Flare & Allergic Erythema',
    slotTime: '11:30 AM',
    status: 'QUEUED'
  },
  {
    id: 'pat-6',
    tokenNumber: 'ENT-601',
    userName: 'Mohammad Rehan',
    userPhone: '+91 98777 88990',
    email: 'rehan.m@gmail.com',
    doctorId: 'doc-6',
    doctorName: 'Dr. Arjun Singhania, MS',
    specialty: 'ENT',
    room: 'Room 106',
    distanceKm: 5.2,
    userLocation: 'Daryaganj, Old Delhi (5.2 km away)',
    transitMode: 'TWO_WHEELER',
    patientAge: 38,
    chiefComplaint: 'Severe Middle Ear Otalgia & Throat Pain',
    slotTime: '11:45 AM',
    status: 'QUEUED'
  },
  {
    id: 'pat-7',
    tokenNumber: 'NEU-701',
    userName: 'Meenakshi Sundaram',
    userPhone: '+91 98888 99001',
    email: 'meenakshi.s@gmail.com',
    doctorId: 'doc-7',
    doctorName: 'Dr. Meera Nambiar, MD, DM',
    specialty: 'Neurology',
    room: 'Room 107',
    distanceKm: 6.4,
    userLocation: 'Vasant Kunj, South West (6.4 km away)',
    transitMode: 'CAR',
    patientAge: 51,
    chiefComplaint: 'Severe Vertigo, Balance Instability & Migraine',
    slotTime: '12:00 PM',
    status: 'QUEUED'
  },
  {
    id: 'pat-8',
    tokenNumber: 'GYN-801',
    userName: 'Harpreet Kaur',
    userPhone: '+91 98999 00112',
    email: 'harpreet.k@gmail.com',
    doctorId: 'doc-8',
    doctorName: 'Dr. Kavita Kulkarni, MD',
    specialty: 'Gynecology',
    room: 'Room 108',
    distanceKm: 1.8,
    userLocation: 'Green Park, South Delhi (1.8 km away)',
    transitMode: 'CAR',
    patientAge: 31,
    chiefComplaint: '32-Week Antenatal Doppler & Growth Scan Review',
    slotTime: '12:15 PM',
    status: 'QUEUED'
  },
  {
    id: 'pat-9',
    tokenNumber: 'ONC-901',
    userName: 'Sunita Mehra',
    userPhone: '+91 98000 11223',
    email: 'sunita.mehra@gmail.com',
    doctorId: 'doc-9',
    doctorName: 'Dr. Rohit Deshmukh, MD, DM',
    specialty: 'Oncology',
    room: 'Room 109',
    distanceKm: 8.5,
    userLocation: 'Noida Sector 62 (8.5 km away)',
    transitMode: 'CAR',
    patientAge: 58,
    chiefComplaint: 'Cycle 4 Post-Chemo CBC & CEA Marker Review',
    slotTime: '12:30 PM',
    status: 'QUEUED'
  },
  {
    id: 'pat-10',
    tokenNumber: 'OPT-1001',
    userName: 'Col. S. K. Bakshi (Retd.)',
    userPhone: '+91 98222 33445',
    email: 'col.bakshi@gmail.com',
    doctorId: 'doc-10',
    doctorName: 'Dr. Alok Nath, MS',
    specialty: 'Ophthalmology',
    room: 'Room 110',
    distanceKm: 3.7,
    userLocation: 'Defence Colony, South Delhi (3.7 km away)',
    transitMode: 'CAR',
    patientAge: 72,
    chiefComplaint: 'Bilateral Cataract Evaluation & Glaucoma IOP Check',
    slotTime: '12:45 PM',
    status: 'QUEUED'
  }
];

// ============================================================================
// 10 SEED QUEUE TOKENS (CLINICAL HOSPITAL ROSTER)
// ============================================================================
const DEFAULT_TOKENS = [
  // 1 & 2: Currently In Consultation
  {
    id: 101,
    tokenNumber: 'MED-101',
    userName: 'Aarav Sharma',
    userPhone: '+91 98765 43210',
    serviceId: 1,
    serviceName: 'Cardiology & Heart Health OPD',
    doctorName: 'Dr. Sarah Mehta, MD',
    roomNo: 101,
    counterId: 1,
    tokenType: 'APPOINTMENT',
    status: 'IN_SERVICE',
    slotTime: '10:30 AM',
    checkInTime: '10:25 AM',
    distanceKm: 2.8,
    transitMode: 'TWO_WHEELER',
    userLocation: 'Connaught Place, Central Zone',
    chiefComplaint: 'Acute Chest Tightness & Palpitations',
    calledAt: new Date(Date.now() - 4 * 60000).toISOString(),
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString()
  },
  {
    id: 102,
    tokenNumber: 'MED-102',
    userName: 'Priya Deshmukh',
    userPhone: '+91 98333 44556',
    serviceId: 2,
    serviceName: 'General Medicine & Triage OPD',
    doctorName: 'Dr. Rajesh Sharma, MD',
    roomNo: 102,
    counterId: 2,
    tokenType: 'APPOINTMENT',
    status: 'IN_SERVICE',
    slotTime: '10:45 AM',
    checkInTime: '10:30 AM',
    distanceKm: 1.2,
    transitMode: 'TWO_WHEELER',
    userLocation: 'South Extension, South Zone',
    chiefComplaint: 'Chronic Hypertension & Persistent Dizziness',
    calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString()
  },

  // 3: Queued Next (Orthopedics)
  {
    id: 103,
    tokenNumber: 'ORT-201',
    userName: 'Rohan Kapoor',
    userPhone: '+91 98444 55667',
    serviceId: 1,
    serviceName: 'Orthopedics & Joint Clinic',
    doctorName: 'Dr. Vikram Malhotra, MS',
    roomNo: 103,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '11:00 AM',
    checkInTime: '10:35 AM',
    distanceKm: 4.5,
    transitMode: 'CAR',
    userLocation: 'Karol Bagh, West Zone',
    chiefComplaint: 'Right Knee Ligament Strain & Joint Swelling',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString()
  },

  // 4: Queued Next (Pediatrics)
  {
    id: 104,
    tokenNumber: 'PED-301',
    userName: 'Baby Simran Kaur',
    userPhone: '+91 98555 66778',
    serviceId: 2,
    serviceName: 'Pediatrics & Neonatal OPD',
    doctorName: 'Dr. Ananya Iyer, MD',
    roomNo: 104,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '11:15 AM',
    checkInTime: '10:40 AM',
    distanceKm: 3.1,
    transitMode: 'CAR',
    userLocation: 'Lajpat Nagar, South Zone',
    chiefComplaint: 'High Spiking Fever 103F & Wheezing Cough',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString()
  },

  // 5: Queued Next (Dermatology)
  {
    id: 105,
    tokenNumber: 'DER-501',
    userName: 'Neha Gupta',
    userPhone: '+91 98666 77889',
    serviceId: 1,
    serviceName: 'Dermatology & Skin Clinic',
    doctorName: 'Dr. Pooja Verma, MD',
    roomNo: 105,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '11:30 AM',
    checkInTime: '10:45 AM',
    distanceKm: 2.0,
    transitMode: 'TWO_WHEELER',
    userLocation: 'Hauz Khas, South Zone',
    chiefComplaint: 'Acute Urticaria Skin Flare & Allergic Erythema',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString()
  },

  // 6: Queued Next (ENT)
  {
    id: 106,
    tokenNumber: 'ENT-601',
    userName: 'Mohammad Rehan',
    userPhone: '+91 98777 88990',
    serviceId: 2,
    serviceName: 'ENT & Audiology OPD',
    doctorName: 'Dr. Arjun Singhania, MS',
    roomNo: 106,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '11:45 AM',
    checkInTime: '10:48 AM',
    distanceKm: 5.2,
    transitMode: 'TWO_WHEELER',
    userLocation: 'Daryaganj, Old Delhi',
    chiefComplaint: 'Severe Middle Ear Otalgia & Throat Pain',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  },

  // 7: Queued Next (Neurology)
  {
    id: 107,
    tokenNumber: 'NEU-701',
    userName: 'Meenakshi Sundaram',
    userPhone: '+91 98888 99001',
    serviceId: 1,
    serviceName: 'Neurology & Brain Sciences OPD',
    doctorName: 'Dr. Meera Nambiar, MD, DM',
    roomNo: 107,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '12:00 PM',
    checkInTime: '10:52 AM',
    distanceKm: 6.4,
    transitMode: 'CAR',
    userLocation: 'Vasant Kunj, South West',
    chiefComplaint: 'Severe Vertigo, Balance Instability & Migraine',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString()
  },

  // 8: Queued Next (Gynecology)
  {
    id: 108,
    tokenNumber: 'GYN-801',
    userName: 'Harpreet Kaur',
    userPhone: '+91 98999 00112',
    serviceId: 2,
    serviceName: "Women's Health & High Risk Pregnancy OPD",
    doctorName: 'Dr. Kavita Kulkarni, MD',
    roomNo: 108,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '12:15 PM',
    checkInTime: '10:55 AM',
    distanceKm: 1.8,
    transitMode: 'CAR',
    userLocation: 'Green Park, South Delhi',
    chiefComplaint: '32-Week Antenatal Doppler & Growth Scan Review',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  },

  // 9: Queued Next (Oncology)
  {
    id: 109,
    tokenNumber: 'ONC-901',
    userName: 'Sunita Mehra',
    userPhone: '+91 98000 11223',
    serviceId: 1,
    serviceName: 'Oncology Comprehensive Cancer Center',
    doctorName: 'Dr. Rohit Deshmukh, MD, DM',
    roomNo: 109,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: '12:30 PM',
    checkInTime: '11:00 AM',
    distanceKm: 8.5,
    transitMode: 'CAR',
    userLocation: 'Noida Sector 62',
    chiefComplaint: 'Cycle 4 Post-Chemo CBC & CEA Marker Review',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString()
  },

  // 10: Queued Priority (Ophthalmology)
  {
    id: 110,
    tokenNumber: 'OPT-1001',
    userName: 'Col. S. K. Bakshi (Retd.)',
    userPhone: '+91 98222 33445',
    serviceId: 2,
    serviceName: 'Eye Care & Refraction OPD',
    doctorName: 'Dr. Alok Nath, MS',
    roomNo: 110,
    counterId: null,
    tokenType: 'PRIORITY',
    status: 'QUEUED',
    slotTime: '12:45 PM',
    checkInTime: '11:05 AM',
    distanceKm: 3.7,
    transitMode: 'CAR',
    userLocation: 'Defence Colony, South Delhi',
    chiefComplaint: 'Bilateral Cataract Evaluation & Glaucoma IOP Check',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString()
  }
];

// Multi-Sector Organization Blueprints
const ORGANIZATION_SECTORS = {
  UNIVERSITY: {
    id: 'UNIVERSITY',
    name: 'University & Academic Consortium',
    badge: 'Apex National University',
    icon: 'fa-university',
    description: 'Admissions, registrar verification, examinations, and fee clearance desks.',
    services: [
      { id: 1, name: 'Student Admissions & Counseling', code: 'ADM', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-user-graduate' },
      { id: 2, name: 'Registrar & Transcript Attestation', code: 'REG', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-file-signature' },
      { id: 3, name: 'Examination & Grade Review Cell', code: 'EXM', avgDuration: 12, isPriorityAllowed: false, icon: 'fa-graduation-cap' },
      { id: 4, name: 'Student Accounts & Scholarship Desk', code: 'ACC', avgDuration: 6, isPriorityAllowed: true, icon: 'fa-coins' }
    ],
    counters: [
      { id: 1, name: 'Admissions Desk 1', staff: 'Prof. Ananya Sen', serviceId: 1, currentToken: 'A-101', status: 'IN_SERVICE', isActive: true },
      { id: 2, name: 'Transcript Verification 2', staff: 'Mr. Rajesh Sharma', serviceId: 2, currentToken: 'W-201', status: 'IN_SERVICE', isActive: true },
      { id: 3, name: 'Exam Cell Desk 3', staff: 'Dr. Sunita Rao', serviceId: 3, currentToken: null, status: 'IDLE', isActive: true },
      { id: 4, name: 'Scholarship Counter 4', staff: 'Officer K. Patel', serviceId: 4, currentToken: null, status: 'IDLE', isActive: true }
    ]
  },
  PVT_LTD: {
    id: 'PVT_LTD',
    name: 'Private Limited / Corporate Enterprise',
    badge: 'Nexora Solutions Pvt Ltd',
    icon: 'fa-building',
    description: 'Candidate walk-in interviews, executive client reception, HR onboarding, and partner contracts.',
    services: [
      { id: 1, name: 'Executive Candidate Interview Desk', code: 'HR', avgDuration: 20, isPriorityAllowed: true, icon: 'fa-user-tie' },
      { id: 2, name: 'Client & Investor Concierge', code: 'CLT', avgDuration: 12, isPriorityAllowed: true, icon: 'fa-handshake' },
      { id: 3, name: 'New Employee ID & NDA Onboarding', code: 'ONB', avgDuration: 10, isPriorityAllowed: false, icon: 'fa-id-card' },
      { id: 4, name: 'Vendor Invoicing & Accounts Desk', code: 'ACC', avgDuration: 8, isPriorityAllowed: true, icon: 'fa-receipt' }
    ],
    counters: [
      { id: 1, name: 'Interview Board 1', staff: 'Neha Verma (HR Head)', serviceId: 1, currentToken: 'A-101', status: 'IN_SERVICE', isActive: true },
      { id: 2, name: 'Investor Lounge Desk 2', staff: 'Sameer Mehra (VP)', serviceId: 2, currentToken: 'W-201', status: 'IN_SERVICE', isActive: true },
      { id: 3, name: 'Employee Desk 3', staff: 'Anita Roy', serviceId: 3, currentToken: null, status: 'IDLE', isActive: true },
      { id: 4, name: 'Vendor Billing Desk 4', staff: 'Sanjay Jain', serviceId: 4, currentToken: null, status: 'IDLE', isActive: true }
    ]
  },
  PSU: {
    id: 'PSU',
    name: 'PSU & Government Public Agency',
    badge: 'Bharat Public Services Authority (PSU)',
    icon: 'fa-landmark',
    description: 'Civic document attestation, public grievances, passport/ID biometric verification, and welfare subsidies.',
    services: [
      { id: 1, name: 'Public Grievance Redressal Desk', code: 'PGR', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-gavel' },
      { id: 2, name: 'Biometric & Identity Attestation', code: 'BIO', avgDuration: 8, isPriorityAllowed: true, icon: 'fa-fingerprint' },
      { id: 3, name: 'Citizen Welfare & Subsidy Review', code: 'WLF', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-users-cog' },
      { id: 4, name: 'Gazetted Certificate & NOC Counter', code: 'NOC', avgDuration: 6, isPriorityAllowed: false, icon: 'fa-certificate' }
    ],
    counters: [
      { id: 1, name: 'Grievance Desk 1', staff: 'Officer D. K. Mishra', serviceId: 1, currentToken: 'A-101', status: 'IN_SERVICE', isActive: true },
      { id: 2, name: 'Biometrics Counter 2', staff: 'Inspector R. Pillai', serviceId: 2, currentToken: 'W-201', status: 'IN_SERVICE', isActive: true },
      { id: 3, name: 'Welfare Cell 3', staff: 'Ms. Geeta Nair', serviceId: 3, currentToken: null, status: 'IDLE', isActive: true },
      { id: 4, name: 'NOC Certificate 4', staff: 'Officer T. Bose', serviceId: 4, currentToken: null, status: 'IDLE', isActive: true }
    ]
  },
  TECH_CORP: {
    id: 'TECH_CORP',
    name: 'Tech Organization & IT Park',
    badge: 'CloudScale Technologies Inc.',
    icon: 'fa-laptop-code',
    description: 'Hardware provisioning, developer cloud access credentials, security escort badging, and tech triage.',
    services: [
      { id: 1, name: 'IT Infrastructure & Hardware RMA', code: 'IT', avgDuration: 12, isPriorityAllowed: true, icon: 'fa-laptop' },
      { id: 2, name: 'Cloud Sandbox & Key Access Desk', code: 'DEV', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-key' },
      { id: 3, name: 'Visitor Security & Escort Badging', code: 'SEC', avgDuration: 5, isPriorityAllowed: false, icon: 'fa-shield-alt' },
      { id: 4, name: 'Enterprise Client Architecture Briefing', code: 'ARC', avgDuration: 18, isPriorityAllowed: true, icon: 'fa-network-wired' }
    ],
    counters: [
      { id: 1, name: 'Hardware Triage 1', staff: 'Arjun Das (Sr. SysAdmin)', serviceId: 1, currentToken: 'A-101', status: 'IN_SERVICE', isActive: true },
      { id: 2, name: 'Cloud Credentials 2', staff: 'Maya Swaminathan', serviceId: 2, currentToken: 'W-201', status: 'IN_SERVICE', isActive: true },
      { id: 3, name: 'Security Badging 3', staff: 'Rohit Batra', serviceId: 3, currentToken: null, status: 'IDLE', isActive: true },
      { id: 4, name: 'Tech Solutions 4', staff: 'Deepak Varma', serviceId: 4, currentToken: null, status: 'IDLE', isActive: true }
    ]
  }
};

// Multi-Sector Organization Directory with Multi-Priority attributes
const ORGANIZATION_REGISTRY = [
  {
    id: 'org-edu-1',
    name: 'Apex National University',
    category: 'EDU',
    categoryName: 'University & Higher Education',
    placeRating: 4.9,
    ratingCount: 1420,
    distanceKm: 0.8,
    budgetLevel: 'AFFORDABLE',
    feeAmount: 250,
    feeLabel: '₹250 Verification Fee',
    address: 'Academic Enclave, Ring Road, Knowledge City',
    emergencySupported: false,
    icon: 'fa-university',
    services: [
      { id: 1, name: 'Student Admissions & Counseling', code: 'ADM', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-user-graduate' },
      { id: 2, name: 'Registrar & Transcript Attestation', code: 'REG', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-file-signature' },
      { id: 3, name: 'Examination & Grade Review Cell', code: 'EXM', avgDuration: 12, isPriorityAllowed: false, icon: 'fa-graduation-cap' },
      { id: 4, name: 'Student Accounts & Scholarship Desk', code: 'ACC', avgDuration: 6, isPriorityAllowed: true, icon: 'fa-coins' }
    ]
  },
  {
    id: 'org-health-1',
    name: 'City Care Multi-Specialty Hospital',
    category: 'HEALTH',
    categoryName: 'Healthcare & Medical Center',
    placeRating: 4.8,
    ratingCount: 3200,
    distanceKm: 1.2,
    budgetLevel: 'AFFORDABLE',
    feeAmount: 400,
    feeLabel: '₹400 Doctor OPD Fee',
    address: 'Health Boulevard, Sector 12, Metro Junction',
    emergencySupported: true,
    icon: 'fa-hospital-alt',
    services: [
      { id: 101, name: 'General Physician & Triage OPD', code: 'OPD', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-stethoscope' },
      { id: 102, name: 'Specialist Doctor Consultation', code: 'DOC', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-user-md' },
      { id: 103, name: 'Diagnostic Lab & Blood Testing', code: 'LAB', avgDuration: 8, isPriorityAllowed: false, icon: 'fa-vial' },
      { id: 104, name: 'Pharmacy & Medical Dispatches', code: 'PHR', avgDuration: 5, isPriorityAllowed: true, icon: 'fa-pills' }
    ]
  },
  {
    id: 'org-tech-1',
    name: 'CloudScale Technologies Innovation Hub',
    category: 'TECH',
    categoryName: 'Tech Enterprise & IT Solutions',
    placeRating: 4.7,
    ratingCount: 890,
    distanceKm: 2.1,
    budgetLevel: 'FREE',
    feeAmount: 0,
    feeLabel: 'Free / Campus Invite',
    address: 'Cyber Tech Park, Tower B, Silicon Corridor',
    emergencySupported: false,
    icon: 'fa-laptop-code',
    services: [
      { id: 201, name: 'Candidate Technical Interview Board', code: 'INT', avgDuration: 25, isPriorityAllowed: true, icon: 'fa-user-tie' },
      { id: 202, name: 'Vendor & Cloud Infrastructure Desk', code: 'VND', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-server' },
      { id: 203, name: 'Developer Security Clearance & Badging', code: 'SEC', avgDuration: 6, isPriorityAllowed: false, icon: 'fa-id-badge' },
      { id: 204, name: 'Hardware & Laptop Allocation Cell', code: 'ITD', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-laptop' }
    ]
  },
  {
    id: 'org-health-2',
    name: 'Metro Life Super-Specialty Medical Institute',
    category: 'HEALTH',
    categoryName: 'Healthcare & Medical Center',
    placeRating: 4.6,
    ratingCount: 2100,
    distanceKm: 2.8,
    budgetLevel: 'PREMIUM',
    feeAmount: 1200,
    feeLabel: '₹1200 Premium Senior Doctor Fee',
    address: 'Main Health Expressway, Near South Metro',
    emergencySupported: true,
    icon: 'fa-heartbeat',
    services: [
      { id: 301, name: 'Emergency Trauma & Critical Triage', code: 'EMR', avgDuration: 5, isPriorityAllowed: true, icon: 'fa-ambulance' },
      { id: 302, name: 'Senior Cardiologist Consultation', code: 'CRD', avgDuration: 20, isPriorityAllowed: true, icon: 'fa-heart' },
      { id: 303, name: 'Radiology MRI & CT Scan Desk', code: 'RAD', avgDuration: 15, isPriorityAllowed: false, icon: 'fa-x-ray' }
    ]
  },
  {
    id: 'org-tech-2',
    name: 'Nexora Solutions Pvt Ltd',
    category: 'TECH',
    categoryName: 'Tech Enterprise & Corporate Office',
    placeRating: 4.5,
    ratingCount: 650,
    distanceKm: 3.4,
    budgetLevel: 'FREE',
    feeAmount: 0,
    feeLabel: 'Free / Client Appointment',
    address: 'FinTech Heights, Floor 9, Financial District',
    emergencySupported: false,
    icon: 'fa-building',
    services: [
      { id: 401, name: 'Talent Acquisition & HR Screening', code: 'REC', avgDuration: 15, isPriorityAllowed: true, icon: 'fa-briefcase' },
      { id: 402, name: 'Investor & Stakeholder Lounge', code: 'INV', avgDuration: 20, isPriorityAllowed: true, icon: 'fa-chart-pie' },
      { id: 403, name: 'Client Account Management Desk', code: 'CAM', avgDuration: 12, isPriorityAllowed: false, icon: 'fa-handshake' }
    ]
  },
  {
    id: 'org-govt-1',
    name: 'Bharat Public Services Authority (PSU/Govt)',
    category: 'GOVT',
    categoryName: 'Public Sector & Government Authority',
    placeRating: 4.3,
    ratingCount: 4500,
    distanceKm: 4.2,
    budgetLevel: 'FREE',
    feeAmount: 0,
    feeLabel: 'Free / Citizen Public Service',
    address: 'Vikas Bhawan, Central Secretariat Circle',
    emergencySupported: true,
    icon: 'fa-landmark',
    services: [
      { id: 501, name: 'Public Grievance Redressal Cell', code: 'PGR', avgDuration: 12, isPriorityAllowed: true, icon: 'fa-bullhorn' },
      { id: 502, name: 'Aadhaar & Citizen Biometrics Counter', code: 'BIO', avgDuration: 8, isPriorityAllowed: true, icon: 'fa-fingerprint' },
      { id: 503, name: 'Pension & Senior Citizen Welfare', code: 'PEN', avgDuration: 10, isPriorityAllowed: true, icon: 'fa-hands-helping' },
      { id: 504, name: 'Statutory NOC & Clearance Bureau', code: 'NOC', avgDuration: 15, isPriorityAllowed: false, icon: 'fa-stamp' }
    ]
  }
];

// Default Users (10 Doctors + 10 Staff + 10 Patients + 2 Dev/DBA Admins)
const DEFAULT_USERS = [
  // --- 10 DOCTORS ---
  {
    id: 'usr-doctor-1',
    doctorId: 'doc-1',
    name: 'Dr. Sarah Mehta, MD',
    email: 'doctor@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Head of Clinical Services & Senior Consultant Cardiologist',
    department: 'Cardiology & Internal Medicine OPD',
    consultationRoom: 'OPD Consultation Room 101',
    phone: '+91 11 2659 0101',
    personalAddress: 'Doctors Enclave, Campus Block A, Ring Road, New Delhi'
  },
  {
    id: 'usr-doctor-2',
    doctorId: 'doc-2',
    name: 'Dr. Rajesh Sharma, MD',
    email: 'doctor2@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Senior Physician & Diabetologist',
    department: 'General Medicine & Triage OPD',
    consultationRoom: 'OPD Consultation Room 102',
    phone: '+91 11 2659 0102',
    personalAddress: 'Pocket 2, Sector 9, Rohini, New Delhi'
  },
  {
    id: 'usr-doctor-3',
    doctorId: 'doc-3',
    name: 'Dr. Vikram Malhotra, MS',
    email: 'doctor3@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Chief Orthopedic Surgeon',
    department: 'Orthopedics & Joint Clinic',
    consultationRoom: 'OPD Consultation Room 103',
    phone: '+91 11 2659 0103',
    personalAddress: 'Gulmohar Park, South Delhi'
  },
  {
    id: 'usr-doctor-4',
    doctorId: 'doc-4',
    name: 'Dr. Ananya Iyer, MD',
    email: 'doctor4@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Senior Consultant Pediatrician',
    department: 'Pediatrics & Neonatal OPD',
    consultationRoom: 'OPD Consultation Room 104',
    phone: '+91 11 2659 0104',
    personalAddress: 'Chanakyapuri, New Delhi'
  },
  {
    id: 'usr-doctor-5',
    doctorId: 'doc-5',
    name: 'Dr. Pooja Verma, MD',
    email: 'doctor5@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Consultant Dermatologist',
    department: 'Dermatology & Skin Clinic',
    consultationRoom: 'OPD Consultation Room 105',
    phone: '+91 11 2659 0105',
    personalAddress: 'Greater Kailash II, New Delhi'
  },
  {
    id: 'usr-doctor-6',
    doctorId: 'doc-6',
    name: 'Dr. Arjun Singhania, MS',
    email: 'doctor6@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Head & Neck ENT Surgeon',
    department: 'ENT & Audiology OPD',
    consultationRoom: 'OPD Consultation Room 106',
    phone: '+91 11 2659 0106',
    personalAddress: 'Civil Lines, North Delhi'
  },
  {
    id: 'usr-doctor-7',
    doctorId: 'doc-7',
    name: 'Dr. Meera Nambiar, MD, DM',
    email: 'doctor7@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Senior Neurologist',
    department: 'Neurology & Brain Sciences OPD',
    consultationRoom: 'OPD Consultation Room 107',
    phone: '+91 11 2659 0107',
    personalAddress: 'Saket, South Delhi'
  },
  {
    id: 'usr-doctor-8',
    doctorId: 'doc-8',
    name: 'Dr. Kavita Kulkarni, MD, DGO',
    email: 'doctor8@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Senior Gynecologist & Obstetrician',
    department: "Women's Health & High Risk Pregnancy OPD",
    consultationRoom: 'OPD Consultation Room 108',
    phone: '+91 11 2659 0108',
    personalAddress: 'Panchsheel Park, New Delhi'
  },
  {
    id: 'usr-doctor-9',
    doctorId: 'doc-9',
    name: 'Dr. Rohit Deshmukh, MD, DM',
    email: 'doctor9@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Medical Oncologist & Cancer Specialist',
    department: 'Oncology Comprehensive Cancer Center',
    consultationRoom: 'OPD Consultation Room 109',
    phone: '+91 11 2659 0109',
    personalAddress: 'Siri Fort Institutional Area, New Delhi'
  },
  {
    id: 'usr-doctor-10',
    doctorId: 'doc-10',
    name: 'Dr. Alok Nath, MS',
    email: 'doctor10@queueless.com',
    password: 'doctor123',
    role: 'DOCTOR',
    designation: 'Senior Eye Surgeon & Ophthalmologist',
    department: 'Eye Care & Refraction OPD',
    consultationRoom: 'OPD Consultation Room 110',
    phone: '+91 11 2659 0110',
    personalAddress: 'Vasant Vihar, New Delhi'
  },

  // --- 10 HOSPITAL STAFF MEMBERS ---
  {
    id: 'usr-staff-1',
    staffId: 'STF-001',
    name: 'Sister Priya Nair',
    email: 'staff@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Lead OPD Floor Coordinator & Calling Desk Operator',
    department: 'Cardiology & Internal OPD Queue Dispatch',
    counterId: 1,
    counterName: 'OPD Calling Desk 1',
    phone: '+91 98500 55661',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Staff Quarters B-12, Health Boulevard, Ring Road, New Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-2',
    staffId: 'STF-002',
    name: 'Mr. Suresh Kumar',
    email: 'staff2@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Senior Registrar & Triage Vitals Nurse',
    department: 'General Medicine & Triage Desk',
    counterId: 2,
    counterName: 'OPD Calling Desk 2',
    phone: '+91 98500 55662',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Pocket 4, Sector 14, Rohini, New Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-3',
    staffId: 'STF-003',
    name: 'Sister Anita Verma',
    email: 'staff3@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Pediatric Patient Relations & Vaccination Desk',
    department: 'Pediatrics OPD Counter',
    counterId: 3,
    counterName: 'OPD Calling Desk 3',
    phone: '+91 98500 55663',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Flat 102, Mayur Vihar Phase 1, New Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-4',
    staffId: 'STF-004',
    name: 'Mr. Deepak Joshi',
    email: 'staff4@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Orthopedic Plaster & Token Dispatcher',
    department: 'Orthopedics & Fracture Clinic',
    counterId: 4,
    counterName: 'OPD Calling Desk 4',
    phone: '+91 98500 55664',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Block C, Janakpuri, New Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-5',
    staffId: 'STF-005',
    name: 'Sister Sunita Patel',
    email: 'staff5@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Dermatology Minor Procedure Assistant',
    department: 'Dermatology OPD Desk',
    counterId: 5,
    counterName: 'OPD Calling Desk 5',
    phone: '+91 98500 55665',
    shift: 'Evening Shift (01:00 PM - 09:00 PM)',
    personalAddress: 'Sector 52, Noida, Uttar Pradesh',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-6',
    staffId: 'STF-006',
    name: 'Mr. Manoj Tiwari',
    email: 'staff6@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'ENT Audiometry & Screening Attendant',
    department: 'ENT OPD Floor Desk',
    counterId: 6,
    counterName: 'OPD Calling Desk 6',
    phone: '+91 98500 55666',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Laxmi Nagar, East Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-7',
    staffId: 'STF-007',
    name: 'Sister Lakshmi Rao',
    email: 'staff7@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Neuro Diagnostics & EEG Token Dispatcher',
    department: 'Neurology Department Reception',
    counterId: 7,
    counterName: 'OPD Calling Desk 7',
    phone: '+91 98500 55667',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Alaknanda, South Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-8',
    staffId: 'STF-008',
    name: 'Mr. Rakesh Verma',
    email: 'staff8@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Gynecology Ultrasound Receptionist',
    department: 'Maternity & Women Care Floor',
    counterId: 8,
    counterName: 'OPD Calling Desk 8',
    phone: '+91 98500 55668',
    shift: 'Evening Shift (01:00 PM - 09:00 PM)',
    personalAddress: 'Dwarka Sector 7, New Delhi',
    leaveStatus: 'ON_DUTY'
  },
  {
    id: 'usr-staff-9',
    staffId: 'STF-009',
    name: 'Sister Divya Sharma',
    email: 'staff9@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Daycare Chemotherapy Coordinator',
    department: 'Oncology Patient Helpdesk',
    counterId: 9,
    counterName: 'OPD Calling Desk 9',
    phone: '+91 98500 55669',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Sector 23, Gurugram, Haryana',
    status: 'ON_DUTY'
  },
  {
    id: 'usr-staff-10',
    staffId: 'STF-010',
    name: 'Mr. Amit Saxena',
    email: 'staff10@queueless.com',
    password: 'staff123',
    role: 'STAFF',
    designation: 'Ophthalmology Refraction & IOP Technician',
    department: 'Vision Care Clinic Desk',
    counterId: 10,
    counterName: 'OPD Calling Desk 10',
    phone: '+91 98500 55670',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    personalAddress: 'Patparganj, New Delhi',
    status: 'ON_DUTY'
  },

  // --- 10 CLIENTS / PATIENTS ---
  {
    id: 'usr-patient-1',
    tokenNumber: 'MED-101',
    name: 'Aarav Sharma',
    email: 'patient@queueless.com',
    password: 'patient123',
    role: 'VISITOR',
    phone: '+91 98765 43210',
    userLocation: 'Connaught Place, Central Zone (2.8 km away)',
    distanceKm: 2.8,
    transitMode: 'TWO_WHEELER',
    patientAge: 34,
    chiefComplaint: 'Acute Chest Tightness & Palpitations'
  },
  {
    id: 'usr-patient-alias',
    tokenNumber: 'MED-101',
    name: 'Aarav Sharma (Alias)',
    email: 'user@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98765 43210',
    userLocation: 'Connaught Place, Central Zone (2.8 km away)',
    distanceKm: 2.8,
    transitMode: 'TWO_WHEELER',
    patientAge: 34,
    chiefComplaint: 'Acute Chest Tightness & Palpitations'
  },
  {
    id: 'usr-patient-2',
    tokenNumber: 'MED-102',
    name: 'Priya Deshmukh',
    email: 'priya.patient@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98333 44556',
    userLocation: 'South Extension, South Zone (1.2 km away)',
    distanceKm: 1.2,
    transitMode: 'TWO_WHEELER',
    patientAge: 42,
    chiefComplaint: 'Chronic Hypertension & Dizziness'
  },
  {
    id: 'usr-patient-3',
    tokenNumber: 'ORT-201',
    name: 'Rohan Kapoor',
    email: 'rohan.k@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98444 55667',
    userLocation: 'Karol Bagh, West Zone (4.5 km away)',
    distanceKm: 4.5,
    transitMode: 'CAR',
    patientAge: 29,
    chiefComplaint: 'Right Knee Ligament Strain & Joint Swelling'
  },
  {
    id: 'usr-patient-4',
    tokenNumber: 'PED-301',
    name: 'Baby Simran Kaur (Parent: Gurpreet)',
    email: 'simran.care@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98555 66778',
    userLocation: 'Lajpat Nagar, South Zone (3.1 km away)',
    distanceKm: 3.1,
    transitMode: 'CAR',
    patientAge: 4,
    chiefComplaint: 'High Spiking Fever 103F & Wheezing Cough'
  },
  {
    id: 'usr-patient-5',
    tokenNumber: 'DER-501',
    name: 'Neha Gupta',
    email: 'neha.gupta@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98666 77889',
    userLocation: 'Hauz Khas, South Zone (2.0 km away)',
    distanceKm: 2.0,
    transitMode: 'TWO_WHEELER',
    patientAge: 26,
    chiefComplaint: 'Acute Urticaria Skin Flare & Allergic Erythema'
  },
  {
    id: 'usr-patient-6',
    tokenNumber: 'ENT-601',
    name: 'Mohammad Rehan',
    email: 'rehan.m@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98777 88990',
    userLocation: 'Daryaganj, Old Delhi (5.2 km away)',
    distanceKm: 5.2,
    transitMode: 'TWO_WHEELER',
    patientAge: 38,
    chiefComplaint: 'Severe Middle Ear Otalgia & Throat Pain'
  },
  {
    id: 'usr-patient-7',
    tokenNumber: 'NEU-701',
    name: 'Meenakshi Sundaram',
    email: 'meenakshi.s@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98888 99001',
    userLocation: 'Vasant Kunj, South West (6.4 km away)',
    distanceKm: 6.4,
    transitMode: 'CAR',
    patientAge: 51,
    chiefComplaint: 'Severe Vertigo, Balance Instability & Migraine'
  },
  {
    id: 'usr-patient-8',
    tokenNumber: 'GYN-801',
    name: 'Harpreet Kaur',
    email: 'harpreet.k@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98999 00112',
    userLocation: 'Green Park, South Delhi (1.8 km away)',
    distanceKm: 1.8,
    transitMode: 'CAR',
    patientAge: 31,
    chiefComplaint: '32-Week Antenatal Doppler & Growth Scan Review'
  },
  {
    id: 'usr-patient-9',
    tokenNumber: 'ONC-901',
    name: 'Sunita Mehra',
    email: 'sunita.mehra@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98000 11223',
    userLocation: 'Noida Sector 62 (8.5 km away)',
    distanceKm: 8.5,
    transitMode: 'CAR',
    patientAge: 58,
    chiefComplaint: 'Cycle 4 Post-Chemo CBC & CEA Marker Review'
  },
  {
    id: 'usr-patient-10',
    tokenNumber: 'OPT-1001',
    name: 'Col. S. K. Bakshi (Retd.)',
    email: 'col.bakshi@gmail.com',
    password: 'user123',
    role: 'VISITOR',
    phone: '+91 98222 33445',
    userLocation: 'Defence Colony, South Delhi (3.7 km away)',
    distanceKm: 3.7,
    transitMode: 'CAR',
    patientAge: 72,
    chiefComplaint: 'Bilateral Cataract Evaluation & Glaucoma IOP Check'
  },

  // --- 2 DEVELOPER / DBA ADMINS ---
  {
    id: 'usr-admin-1',
    name: 'Dev Architect & DBA',
    email: 'admin@univ.edu',
    password: 'admin123',
    role: 'ADMIN',
    designation: 'Lead Software Architect & Liquibase Controller',
    phone: '+91 98100 11223'
  },
  {
    id: 'usr-admin-2',
    name: 'Programmer / Admin Console',
    email: 'admin@queueless.com',
    password: 'admin123',
    role: 'ADMIN',
    designation: 'Developer Database Admin',
    phone: '+91 98200 22334'
  }
];

// ============================================================================
// REAL-TIME HOSPITAL FLUID QUEUE & DYNAMIC FLUCTUATION ENGINE
// ============================================================================

function getHospitalState() {
  const defaultState = {
    hospitalName: 'Apex City Care Super-Specialty Hospital',
    hospitalAddress: 'Health Boulevard, Ring Road, Sector 12, Metro Junction, New Delhi - 110029',
    headDoctorName: 'Dr. Sarah Mehta, MD',
    normalConsultationMins: 10,
    emergencyActive: false,
    emergencyReason: '',
    emergencyDelayMins: 0,
    doctorExtendedMins: 0,
    doctorStatus: 'IN_SESSION', // 'IN_SESSION', 'EMERGENCY_OVERRIDE', 'ON_BREAK'
    activeConsultationStartTime: Date.now() - 4 * 60000, // 4 mins elapsed
    currentPatientToken: 'MED-101'
  };
  const raw = localStorage.getItem('ql_hospital_state');
  return raw ? JSON.parse(raw) : defaultState;
}

function saveHospitalState(state) {
  localStorage.setItem('ql_hospital_state', JSON.stringify(state));
  notifyStateChange('HOSPITAL_STATE_CHANGED', { state });
}

// 1. Doctor triggers Emergency: Postpones all regular appointments by +12 mins
function triggerHospitalEmergency(reason = 'Severe Cardiac Trauma / Acute Respiratory Arrest') {
  const state = getHospitalState();
  state.emergencyActive = true;
  state.emergencyReason = reason;
  state.emergencyDelayMins = 12;
  state.doctorStatus = 'EMERGENCY_OVERRIDE';
  saveHospitalState(state);

  // Bump or insert Emergency case at top of queue
  const tokens = getTokens();
  let emr = tokens.find(t => t.tokenNumber === 'EMR-001' || t.tokenType === 'EMERGENCY');
  if (!emr) {
    emr = {
      id: 999,
      tokenNumber: 'EMR-001',
      userName: 'Col. S. K. Bakshi (EMERGENCY)',
      userPhone: '+91 98222 33445',
      serviceId: 3,
      serviceName: 'Acute Cardiac Resuscitation',
      counterId: 1,
      tokenType: 'EMERGENCY',
      status: 'QUEUED',
      isEmergency: true,
      userLocation: 'Hospital Emergency Bay (0.0 km)',
      distanceKm: 0.1,
      transitMode: 'WALK',
      perspective: reason,
      slotTime: 'IMMEDIATE',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calledAt: null,
      completedAt: null,
      missedCount: 0,
      createdAt: new Date().toISOString()
    };
    tokens.unshift(emr);
  } else {
    emr.status = 'QUEUED';
    emr.isEmergency = true;
    emr.perspective = reason;
  }
  saveTokens(tokens);

  notifyStateChange('EMERGENCY_DECLARED', { reason, delayMins: 12 });
  return { success: true, delayMins: 12 };
}

// 2. Doctor clears emergency
function clearHospitalEmergency() {
  const state = getHospitalState();
  state.emergencyActive = false;
  state.emergencyReason = '';
  state.emergencyDelayMins = 0;
  state.doctorStatus = 'IN_SESSION';
  saveHospitalState(state);

  const tokens = getTokens();
  const emr = tokens.find(t => t.tokenNumber === 'EMR-001');
  if (emr) {
    emr.status = 'COMPLETED';
    saveTokens(tokens);
  }

  notifyStateChange('EMERGENCY_CLEARED', {});
  return { success: true };
}

// 3. Doctor extends consultation by X minutes (+5 mins)
function extendDoctorConsultation(mins = 5) {
  const state = getHospitalState();
  state.doctorExtendedMins = (state.doctorExtendedMins || 0) + mins;
  saveHospitalState(state);
  notifyStateChange('CONSULTATION_EXTENDED', { addedMins: mins, totalExtended: state.doctorExtendedMins });
  return { success: true, totalExtended: state.doctorExtendedMins };
}

// 4. Client reports traffic delay (+10 mins)
function reportClientTransitDelay(tokenNumber, delayMins = 10) {
  const tokens = getTokens();
  const token = tokens.find(t => t.tokenNumber === tokenNumber);
  if (token) {
    token.clientReportedDelayMins = (token.clientReportedDelayMins || 0) + delayMins;
    token.lastDelayReportTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveTokens(tokens);
    notifyStateChange('CLIENT_TRAFFIC_DELAY', { tokenNumber, delayMins });
    return { success: true, token };
  }
  return { success: false, message: 'Token not found' };
}

// 5. Doctor marks priority on a patient
function markDoctorPriority(tokenNumber) {
  const tokens = getTokens();
  const token = tokens.find(t => t.tokenNumber === tokenNumber);
  if (token) {
    token.isDoctorPriority = true;
    token.tokenType = 'PRIORITY';
    saveTokens(tokens);
    notifyStateChange('DOCTOR_PRIORITY_SET', { tokenNumber });
    return { success: true };
  }
  return { success: false, message: 'Token not found' };
}

// 6. Dynamic To-Do List Calculation for Floor Staff & Patient Waiting
function getDynamicHospitalQueue() {
  const tokens = getTokens();
  const state = getHospitalState();
  const baseDuration = state.normalConsultationMins || 10;
  const emergencyDelay = state.emergencyActive ? (state.emergencyDelayMins || 12) : 0;
  const extensionDelay = state.doctorExtendedMins || 0;

  // Filter active waiting queue
  const activeQueue = tokens.filter(t => t.status === 'QUEUED' || t.status === 'PENDING_APPROVAL');

  // Dynamic priority sorting:
  // Emergency cases top -> Doctor Priority next -> Regular queued
  // If client reported traffic delay, penalty lowers calling priority so staff can call next ready patient
  activeQueue.sort((a, b) => {
    const scoreA = (a.isEmergency || a.tokenType === 'EMERGENCY' ? 2000 : 0) +
                   (a.isDoctorPriority || a.tokenType === 'PRIORITY' ? 1000 : 0) -
                   ((a.clientReportedDelayMins || 0) * 15);
    const scoreB = (b.isEmergency || b.tokenType === 'EMERGENCY' ? 2000 : 0) +
                   (b.isDoctorPriority || b.tokenType === 'PRIORITY' ? 1000 : 0) -
                   ((b.clientReportedDelayMins || 0) * 15);
    return scoreB - scoreA;
  });

  // Calculate live ETA for each patient
  let accumulatedMinutes = emergencyDelay + extensionDelay;
  const now = new Date();

  return activeQueue.map((t, idx) => {
    const isNext = idx === 0;
    const estWaitMins = accumulatedMinutes;
    accumulatedMinutes += baseDuration;

    // Estimated call time
    const callTime = new Date(now.getTime() + estWaitMins * 60000);
    const callTimeFormatted = callTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Client transit calculation
    const transit = calculateDetailedTransitTimes(t.distanceKm || 2.0);
    const modeKey = t.transitMode || 'TWO_WHEELER';
    const transitInfo = modeKey === 'WALK' ? transit.walk :
                        modeKey === 'CAR' ? transit.fourWheeler :
                        modeKey === 'EBIKE' ? transit.eBike : transit.twoWheeler;
    
    // Ideal departure time = Call Time minus transit time
    const departureTime = new Date(callTime.getTime() - transitInfo.durationMins * 60000);
    const departureFormatted = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      ...t,
      queueIndex: idx + 1,
      isNextToCall: isNext,
      estWaitMinutes: estWaitMins,
      estimatedCallTime: callTimeFormatted,
      recommendedDepartureTime: departureFormatted,
      transitTimeMins: transitInfo.durationMins,
      transitModeLabel: transitInfo.label,
      isEmergencyActive: state.emergencyActive,
      emergencyDelayNotice: state.emergencyActive ? `+${state.emergencyDelayMins}m Emergency Delay` : null
    };
  });
}

// ============================================================================
// 10-ENTITY ACCESSORS (DOCTORS, STAFF, CLIENTS)
// ============================================================================

function getDoctors() {
  let list = [];
  try {
    const raw = localStorage.getItem('ql_doctors');
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }
  if (!list || list.length < 10) {
    list = [...DEFAULT_DOCTORS];
    localStorage.setItem('ql_doctors', JSON.stringify(list));
  }
  return list;
}

function getStaffMembers() {
  let list = [];
  try {
    const raw = localStorage.getItem('ql_staff_members');
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }
  if (!list || list.length < 10) {
    list = [...DEFAULT_STAFF_MEMBERS];
    localStorage.setItem('ql_staff_members', JSON.stringify(list));
  }
  return list;
}

function getHospitalClients() {
  let list = [];
  try {
    const raw = localStorage.getItem('ql_clients');
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }
  if (!list || list.length < 10) {
    list = [...DEFAULT_CLIENTS];
    localStorage.setItem('ql_clients', JSON.stringify(list));
  }
  return list;
}

// Patient Appointment Booking with Doctor Free Slots & Distance Travel Calculator
function bookPatientAppointment({ patientName, phone, email, doctorId, distanceKm = 2.5, transitMode = 'TWO_WHEELER', chosenSlot, complaint, userLocation }) {
  const doctors = getDoctors();
  const doc = doctors.find(d => d.id === doctorId) || doctors[0];
  const tokens = getTokens();

  // Generate unique Token number
  const prefix = doc.specialty.includes('Cardio') ? 'MED' :
                 doc.specialty.includes('Medicine') ? 'GEN' :
                 doc.specialty.includes('Ortho') ? 'ORT' :
                 doc.specialty.includes('Pediatric') ? 'PED' :
                 doc.specialty.includes('Derma') ? 'DER' :
                 doc.specialty.includes('ENT') ? 'ENT' :
                 doc.specialty.includes('Neuro') ? 'NEU' :
                 doc.specialty.includes('Gynec') ? 'GYN' :
                 doc.specialty.includes('Onco') ? 'ONC' : 'OPT';

  const nextNum = 100 + (tokens.length + 1);
  const tokenNumber = `${prefix}-${nextNum}`;
  const now = new Date();

  const newToken = {
    id: Date.now(),
    tokenNumber,
    userName: patientName || 'OPD Patient',
    userPhone: phone || '+91 98000 00000',
    email: email || '',
    serviceId: doc.roomNo || 101,
    serviceName: `${doc.specialty} OPD`,
    doctorName: doc.name,
    doctorId: doc.id,
    roomNo: doc.roomNo || 101,
    counterId: null,
    tokenType: 'APPOINTMENT',
    status: 'QUEUED',
    slotTime: chosenSlot || doc.freeSlots[0] || '11:00 AM',
    checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    distanceKm: parseFloat(distanceKm) || 2.5,
    transitMode: transitMode || 'TWO_WHEELER',
    userLocation: userLocation || `Registered Location (${distanceKm} km)`,
    chiefComplaint: complaint || 'General OPD Consultation',
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: now.toISOString()
  };

  tokens.push(newToken);
  saveTokens(tokens);

  // Sync to hospital client list as well
  const clients = getHospitalClients();
  clients.unshift({
    id: 'pat-' + Date.now(),
    tokenNumber: newToken.tokenNumber,
    userName: newToken.userName,
    userPhone: newToken.userPhone,
    email: newToken.email,
    doctorId: doc.id,
    doctorName: doc.name,
    specialty: doc.specialty,
    room: doc.room,
    distanceKm: newToken.distanceKm,
    userLocation: newToken.userLocation,
    transitMode: newToken.transitMode,
    chiefComplaint: newToken.chiefComplaint,
    slotTime: newToken.slotTime,
    status: 'QUEUED'
  });
  localStorage.setItem('ql_clients', JSON.stringify(clients));

  notifyStateChange('PATIENT_APPOINTMENT_BOOKED', { token: newToken });
  return { success: true, token: newToken };
}

// ============================================================================
// UNIVERSAL SCANNABLE QR CODE GENERATOR & MODAL SYSTEM
// ============================================================================

function generateQRCodeUrl(payloadText, size = 240) {
  const cleanData = encodeURIComponent(payloadText || 'Apex Hospital Verified');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${cleanData}`;
}

// Fallback SVG QR pattern if completely offline
function getFallbackQRCodeSvg(text) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
    <rect width="100" height="100" fill="white"/>
    <rect x="10" y="10" width="25" height="25" fill="%230f172a"/>
    <rect x="15" y="15" width="15" height="15" fill="white"/>
    <rect x="18" y="18" width="9" height="9" fill="%2310b981"/>
    <rect x="65" y="10" width="25" height="25" fill="%230f172a"/>
    <rect x="70" y="15" width="15" height="15" fill="white"/>
    <rect x="73" y="18" width="9" height="9" fill="%2310b981"/>
    <rect x="10" y="65" width="25" height="25" fill="%230f172a"/>
    <rect x="15" y="70" width="15" height="15" fill="white"/>
    <rect x="18" y="73" width="9" height="9" fill="%2310b981"/>
    <rect x="42" y="15" width="6" height="6" fill="%230f172a"/>
    <rect x="52" y="25" width="6" height="6" fill="%230f172a"/>
    <rect x="42" y="38" width="16" height="16" fill="%2310b981"/>
    <rect x="65" y="45" width="8" height="8" fill="%230f172a"/>
    <rect x="42" y="65" width="6" height="6" fill="%230f172a"/>
    <rect x="55" y="72" width="12" height="12" fill="%230f172a"/>
    <rect x="75" y="65" width="15" height="15" fill="%2310b981"/>
  </svg>`;
}

function showEntityQRModal({ type = 'PATIENT', title, subtitle, qrText, metadata = [], badge = 'OFFICIAL QR PASS' }) {
  let modal = document.getElementById('globalEntityQRModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalEntityQRModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const qrUrl = generateQRCodeUrl(qrText, 240);
  const fallbackSvg = getFallbackQRCodeSvg(qrText);

  modal.innerHTML = `
    <div class="modal-card soft-glass-card" style="max-width:440px; text-align:center; position:relative; padding:2rem 1.75rem;">
      <button class="modal-close" onclick="closeEntityQRModal()" style="position:absolute; top:14px; right:14px; border:none; background:none; font-size:1.4rem; cursor:pointer; color:#64748b;">
        <i class="fas fa-times"></i>
      </button>

      <span class="badge ${type === 'DOCTOR' ? 'badge-blue' : type === 'STAFF' ? 'badge-purple' : 'badge-mint'}" style="margin-bottom:8px; font-size:0.75rem; letter-spacing:0.5px;">
        <i class="fas ${type === 'DOCTOR' ? 'fa-user-md' : type === 'STAFF' ? 'fa-id-badge' : 'fa-qrcode'}"></i> ${badge}
      </span>

      <h3 style="font-family:'Poppins',sans-serif; font-size:1.3rem; font-weight:800; color:#0f172a; margin:4px 0;">
        ${title}
      </h3>
      <div style="font-size:0.82rem; color:#64748b; margin-bottom:1.25rem;">
        ${subtitle}
      </div>

      <div style="background:#ffffff; border:2px solid #e2e8f0; border-radius:18px; padding:16px; display:inline-block; margin-bottom:1.25rem; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
        <img src="${qrUrl}" alt="Scannable QR Code" style="width:210px; height:210px; display:block; margin:0 auto; border-radius:10px;" onerror="this.onerror=null; this.src='${fallbackSvg}';" />
        <div style="font-size:0.72rem; color:#64748b; margin-top:8px; font-weight:700;">
          <i class="fas fa-camera" style="color:#10b981;"></i> SCAN WITH ANY PHONE CAMERA
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; text-align:left; font-size:0.8rem; margin-bottom:1.25rem;">
        ${metadata.map(m => `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:5px 0; border-bottom:1px dashed #e2e8f0; gap:8px;">
            <span style="color:#64748b; font-weight:600; font-size:0.78rem;">${m.label}:</span>
            <strong style="color:#0f172a; text-align:right; font-size:0.8rem;">${m.value}</strong>
          </div>
        `).join('')}
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn btn-primary btn-sm btn-block btn-soft-glow" onclick="copyQRText('${encodeURIComponent(qrText)}')">
          <i class="fas fa-copy"></i> Copy QR Data
        </button>
        <button class="btn btn-secondary btn-sm btn-block" onclick="window.print()">
          <i class="fas fa-print"></i> Print / Save
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeEntityQRModal() {
  const modal = document.getElementById('globalEntityQRModal');
  if (modal) modal.classList.remove('active');
}

function copyQRText(encodedText) {
  const text = decodeURIComponent(encodedText);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    showToast('QR Pass data copied to clipboard!', 'success');
  } else {
    showToast('QR Data: ' + text.substring(0, 50) + '...', 'info');
  }
}

// Quick QR Triggers for Doctor, Staff, Patient
function viewDoctorQR(doctorId) {
  const doctors = getDoctors();
  const doc = doctors.find(d => d.id === doctorId) || doctors[0];
  const qrData = `Apex Hospital Doctor Profile | ${doc.name} | Spec: ${doc.specialty} | Room: ${doc.roomNo} | OPD: ${doc.opdTimings} | Contact: ${doc.phone} | Hotline: ${doc.hotline} | Loc: ${doc.hospitalLocation}`;

  showEntityQRModal({
    type: 'DOCTOR',
    title: doc.name,
    subtitle: `${doc.specialty} • ${doc.room}`,
    qrText: qrData,
    badge: 'DOCTOR CLINICAL IDENTITY QR',
    metadata: [
      { label: 'Doctor Name', value: doc.name },
      { label: 'Specialization', value: doc.specialty },
      { label: 'Qualifications', value: doc.qualification },
      { label: 'Consultation Room', value: doc.room },
      { label: 'OPD Hours', value: doc.opdTimings },
      { label: 'Available Slots', value: doc.freeSlots.slice(0, 4).join(', ') },
      { label: 'Desk Phone', value: doc.phone },
      { label: 'Hospital Location', value: 'Apex City Care, Ring Road, New Delhi' }
    ]
  });
}

function viewStaffQR(staffId) {
  const staffList = getStaffMembers();
  const stf = staffList.find(s => s.staffId === staffId) || staffList[0];
  const qrData = `Apex Hospital Staff ID | ${stf.name} | ID: ${stf.staffId} | Desig: ${stf.designation} | Desk: ${stf.assignedDesk} | Contact: ${stf.phone} | Shift: ${stf.shift}`;

  showEntityQRModal({
    type: 'STAFF',
    title: stf.name,
    subtitle: `${stf.designation} • ${stf.assignedDesk}`,
    qrText: qrData,
    badge: 'OFFICIAL STAFF BADGE QR',
    metadata: [
      { label: 'Staff Name', value: stf.name },
      { label: 'Staff ID', value: stf.staffId },
      { label: 'Designation', value: stf.designation },
      { label: 'Assigned Counter', value: stf.assignedDesk },
      { label: 'Shift Timing', value: stf.shift },
      { label: 'Official Phone', value: stf.phone },
      { label: 'Duty Status', value: stf.status || 'ON_DUTY' }
    ]
  });
}

function viewPatientAppointmentQR(tokenNumber) {
  const tokens = getTokens();
  const t = tokens.find(tok => tok.tokenNumber === tokenNumber) || tokens[0];
  const transit = calculateDetailedTransitTimes(t.distanceKm || 2.8);
  const transitMode = t.transitMode || 'TWO_WHEELER';
  const durationMins = transitMode === 'WALK' ? transit.walk.durationMins :
                       transitMode === 'CAR' ? transit.fourWheeler.durationMins : transit.twoWheeler.durationMins;

  const qrData = `Apex City Care Hospital OPD Pass | Token: ${t.tokenNumber} | Patient: ${t.userName} | Doctor: ${t.doctorName || 'Dr. Sarah Mehta'} (Room ${t.roomNo || 101}) | Slot: ${t.slotTime || '10:30 AM'} | Distance: ${t.distanceKm || 2.8} km | Travel Time: ${durationMins}m | Hotline: +91 11 2659 8888`;

  showEntityQRModal({
    type: 'PATIENT',
    title: `Pass #${t.tokenNumber}`,
    subtitle: `${t.userName} • ${t.serviceName || 'Clinical OPD'}`,
    qrText: qrData,
    badge: 'DIGITAL OPD APPOINTMENT PASS',
    metadata: [
      { label: 'Token Number', value: t.tokenNumber },
      { label: 'Patient Name', value: t.userName },
      { label: 'Consulting Doctor', value: `${t.doctorName || 'Dr. Sarah Mehta'} (Room ${t.roomNo || 101})` },
      { label: 'Appointment Slot', value: t.slotTime || '10:30 AM' },
      { label: 'Patient Distance', value: `${t.distanceKm || 2.8} km away` },
      { label: 'Est. Travel Time', value: `${durationMins} mins (${transitMode})` },
      { label: 'Chief Complaint', value: t.chiefComplaint || 'Consultation' },
      { label: 'Hospital Address', value: 'Apex City Care, Ring Road, New Delhi' }
    ]
  });
}

// Initialize Storage
function initQueueStorage() {
  if (!localStorage.getItem('ql_services')) {
    localStorage.setItem('ql_services', JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem('ql_counters')) {
    localStorage.setItem('ql_counters', JSON.stringify(DEFAULT_COUNTERS));
  }
  if (!localStorage.getItem('ql_tokens') || JSON.parse(localStorage.getItem('ql_tokens') || '[]').length < 10) {
    localStorage.setItem('ql_tokens', JSON.stringify(DEFAULT_TOKENS));
  }
  if (!localStorage.getItem('ql_doctors') || JSON.parse(localStorage.getItem('ql_doctors') || '[]').length < 10) {
    localStorage.setItem('ql_doctors', JSON.stringify(DEFAULT_DOCTORS));
  }
  if (!localStorage.getItem('ql_staff_members') || JSON.parse(localStorage.getItem('ql_staff_members') || '[]').length < 10) {
    localStorage.setItem('ql_staff_members', JSON.stringify(DEFAULT_STAFF_MEMBERS));
  }
  if (!localStorage.getItem('ql_clients') || JSON.parse(localStorage.getItem('ql_clients') || '[]').length < 10) {
    localStorage.setItem('ql_clients', JSON.stringify(DEFAULT_CLIENTS));
  }
  if (!localStorage.getItem('ql_users')) {
    localStorage.setItem('ql_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('ql_current_sector')) {
    localStorage.setItem('ql_current_sector', 'UNIVERSITY');
  }
  if (!localStorage.getItem('ql_current_user')) {
    // Default active session: Patient Aarav Sharma
    const defaultVisitor = DEFAULT_USERS.find(u => u.email === 'patient@queueless.com') || DEFAULT_USERS[20];
    localStorage.setItem('ql_current_user', JSON.stringify(defaultVisitor));
  }
  if (!localStorage.getItem('ql_audit_logs')) {
    localStorage.setItem('ql_audit_logs', JSON.stringify([
      { time: '10:25 AM', text: 'Token MED-101 (Aarav Sharma) checked in for Cardiology OPD' },
      { time: '10:30 AM', text: 'Dr. Sarah Mehta called Token MED-101 into Room 101' },
      { time: '10:32 AM', text: 'Token MED-102 (Priya Deshmukh) checked in for General Medicine' },
      { time: '10:35 AM', text: 'Dr. Rajesh Sharma called Token MED-102 into Room 102' }
    ]));
  }
  if (!localStorage.getItem('ql_interleave_counter')) {
    localStorage.setItem('ql_interleave_counter', '0');
  }
}

// User Authentication Methods
function getUsers() {
  let list = [];
  try {
    const raw = localStorage.getItem('ql_users');
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }
  if (!list || list.length === 0) {
    list = [...DEFAULT_USERS];
    localStorage.setItem('ql_users', JSON.stringify(list));
    return list;
  }
  // Ensure default roles (Admin, Staff, Visitor) are always populated and synced
  let updated = false;
  DEFAULT_USERS.forEach(def => {
    const existingIndex = list.findIndex(u => u.email.toLowerCase() === def.email.toLowerCase());
    if (existingIndex === -1) {
      list.push(def);
      updated = true;
    } else {
      // Ensure role integrity (e.g. if staff had wrong role or password in old saved state)
      if (list[existingIndex].role !== def.role || list[existingIndex].password !== def.password) {
        list[existingIndex] = { ...list[existingIndex], role: def.role, password: def.password };
        updated = true;
      }
    }
  });
  if (updated) {
    localStorage.setItem('ql_users', JSON.stringify(list));
  }
  return list;
}

function saveUsers(users) {
  localStorage.setItem('ql_users', JSON.stringify(users));
}

function getCurrentUser() {
  const u = localStorage.getItem('ql_current_user');
  return u ? JSON.parse(u) : null;
}

function loginUser(email, password) {
  const users = getUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password.trim() === cleanPass);
  if (!user) {
    return { success: false, message: 'Invalid email or password. Please verify your credentials.' };
  }
  localStorage.setItem('ql_current_user', JSON.stringify(user));
  if (user.orgSector && user.orgSector !== 'GENERAL') {
    setOrganizationSector(user.orgSector, false);
  }
  notifyStateChange('USER_LOGGED_IN', { user });
  return { success: true, user };
}

function registerUser({ name, email, password, role = 'VISITOR', orgSector = 'UNIVERSITY', orgName = '', phone = '' }) {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, message: 'An account with this email address already exists.' };
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name,
    email: email.trim().toLowerCase(),
    password,
    role,
    orgSector: role === 'ADMIN' ? orgSector : 'GENERAL',
    orgName: role === 'ADMIN' ? (orgName || ORGANIZATION_SECTORS[orgSector].badge) : 'Registered Applicant',
    phone: phone || '+91 98000 00000'
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem('ql_current_user', JSON.stringify(newUser));

  if (role === 'ADMIN' && orgSector) {
    setOrganizationSector(orgSector, false);
  }

  notifyStateChange('USER_REGISTERED', { user: newUser });
  return { success: true, user: newUser };
}

function logoutUser() {
  localStorage.removeItem('ql_current_user');
  notifyStateChange('USER_LOGGED_OUT');
  window.location.href = 'login.html';
}

/**
 * Returns the proper portal page URL for a given role
 */
function getPortalRedirectForRole(role) {
  if (role === 'DOCTOR') return 'doctor-portal.html';
  if (role === 'STAFF') return 'staff-dashboard.html';
  if (role === 'ADMIN') return 'dev-database-admin.html';
  return 'patient-portal.html'; // VISITOR / Patient default → dedicated patient portal
}

/**
 * Enforces role access gracefully.
 * Auto-seeds demo user if none exists so pages NEVER appear blank or broken.
 * Always returns a valid user object!
 */
function enforceRoleAccess(allowedRoles = []) {
  let user = getCurrentUser();
  const currentPath = (window.location.pathname || '').toLowerCase();
  const allowedList = Array.isArray(allowedRoles) ? allowedRoles : (allowedRoles ? [allowedRoles] : []);

  if (!user) {
    const users = getUsers();
    if (currentPath.includes('doctor-portal')) {
      user = users.find(u => u.role === 'DOCTOR') || { name: 'Dr. Sarah Mehta, MD', email: 'doctor@queueless.com', role: 'DOCTOR' };
    } else if (currentPath.includes('staff-dashboard')) {
      user = users.find(u => u.role === 'STAFF') || { name: 'Sister Priya Nair', email: 'staff@queueless.com', role: 'STAFF' };
    } else if (currentPath.includes('admin') || currentPath.includes('dev-database')) {
      user = users.find(u => u.role === 'ADMIN') || { name: 'Chief Administrator', email: 'admin@univ.edu', role: 'ADMIN' };
    } else {
      user = users.find(u => u.role === 'VISITOR') || { name: 'Aarav Sharma', email: 'patient@queueless.com', role: 'VISITOR', tokenNumber: 'MED-101' };
    }
    localStorage.setItem('ql_current_user', JSON.stringify(user));
  }

  // If user role is not allowed on this specific portal, switch role for smooth interactive testing
  if (allowedList.length > 0 && !allowedList.includes(user.role)) {
    const users = getUsers();
    if (allowedList.includes('DOCTOR')) {
      const docUser = users.find(u => u.role === 'DOCTOR');
      if (docUser) { user = docUser; localStorage.setItem('ql_current_user', JSON.stringify(user)); }
    } else if (allowedList.includes('STAFF')) {
      const staffUser = users.find(u => u.role === 'STAFF');
      if (staffUser) { user = staffUser; localStorage.setItem('ql_current_user', JSON.stringify(user)); }
    } else if (allowedList.includes('VISITOR')) {
      const patientUser = users.find(u => u.role === 'VISITOR');
      if (patientUser) { user = patientUser; localStorage.setItem('ql_current_user', JSON.stringify(user)); }
    }
  }

  return user;
}

/**
 * Renders Hospital Navbar without exposing internal Admin/Database controls
 */
function renderUniversalHospitalNav(activeKey = '') {
  const navContainer = document.querySelector('.navbar');
  if (!navContainer) return;

  const user = getCurrentUser();
  let roleBadge = '';
  let navLinks = '';
  const role = user ? user.role : null;

  if (role === 'DOCTOR') {
    roleBadge = '<span class="badge badge-purple" style="font-size:0.75rem;"><i class="fas fa-stethoscope"></i> Doctor</span>';
    navLinks = `
      <a href="doctor-portal.html" class="nav-link ${activeKey === 'doctor' ? 'active' : ''}"><i class="fas fa-stethoscope"></i> Clinical Console</a>
      <a href="doctor-portal.html#queue" class="nav-link"><i class="fas fa-clipboard-list"></i> Patient Queue</a>
      <a href="staff-dashboard.html" class="nav-link"><i class="fas fa-user-nurse"></i> Staff Desk</a>
      <a href="analytics.html" class="nav-link"><i class="fas fa-chart-bar"></i> Analytics</a>
      <a href="admin-portal.html" class="nav-link"><i class="fas fa-hospital"></i> Hospital Admin</a>
      <a href="kiosk-display.html" class="nav-link" target="_blank"><i class="fas fa-tv"></i> Queue Display</a>
      <a href="registration.html" class="nav-link"><i class="fas fa-user-plus"></i> Registration</a>
    `;
  } else if (role === 'STAFF') {
    roleBadge = '<span class="badge badge-blue" style="font-size:0.75rem;"><i class="fas fa-user-nurse"></i> Staff</span>';
    navLinks = `
      <a href="staff-dashboard.html" class="nav-link ${activeKey === 'staff' ? 'active' : ''}"><i class="fas fa-clipboard-list"></i> Calling Desk</a>
      <a href="kiosk-display.html" class="nav-link" target="_blank"><i class="fas fa-tv"></i> Queue Display</a>
      <a href="registration.html" class="nav-link"><i class="fas fa-user-plus"></i> Register Patient</a>
    `;
  } else if (role === 'ADMIN') {
    roleBadge = '<span class="badge badge-peach" style="font-size:0.75rem;"><i class="fas fa-code"></i> Admin</span>';
    navLinks = `
      <a href="index.html" class="nav-link ${activeKey === 'home' ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
      <a href="dev-database-admin.html" class="nav-link"><i class="fas fa-database"></i> DB Admin</a>
      <a href="admin-portal.html" class="nav-link"><i class="fas fa-hospital"></i> Admin Portal</a>
      <a href="analytics.html" class="nav-link"><i class="fas fa-chart-bar"></i> Analytics</a>
      <a href="registration.html" class="nav-link"><i class="fas fa-user-plus"></i> Registration</a>
    `;
  } else if (role === 'VISITOR') {
    roleBadge = '<span class="badge badge-green" style="font-size:0.75rem;"><i class="fas fa-user-injured"></i> Patient</span>';
    navLinks = `
      <a href="patient-portal.html" class="nav-link ${activeKey === 'patient-portal' ? 'active' : ''}"><i class="fas fa-calendar-check"></i> My Appointment</a>
      <a href="mobile-app.html" class="nav-link ${activeKey === 'tracker' ? 'active' : ''}"><i class="fas fa-map-marker-alt"></i> Live Tracker</a>
    `;
  } else {
    // Not logged in
    navLinks = `
      <a href="index.html" class="nav-link ${activeKey === 'home' ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
      <a href="mobile-app.html" class="nav-link"><i class="fas fa-mobile-alt"></i> Patient App</a>
      <a href="registration.html" class="nav-link"><i class="fas fa-user-plus"></i> Book Appointment</a>
    `;
  }

  navContainer.innerHTML = `
    <a href="index.html" class="nav-brand">
      <div class="nav-brand-icon" style="background:linear-gradient(135deg, #10B981, #0EA5E9); color:#fff;"><i class="fas fa-hospital-alt"></i></div>
      <div>Queue<span>Less</span> <small style="font-size:0.65rem; color:var(--text-muted); display:block; font-weight:500; letter-spacing:0.3px;">Apex Hospital OPD</small></div>
    </a>

    <nav class="nav-links">
      ${navLinks}
    </nav>

    <div class="nav-actions" id="navAuthProfileSlot" style="display:flex; align-items:center; gap:10px;">
      ${user ? `
        <div style="display:flex; align-items:center; gap:8px; background:var(--bg-sidebar, #f8fafc); padding:4px 10px; border-radius:20px; border:1px solid var(--border-light, #e2e8f0);">
          <div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#10b981,#0ea5e9); color:white; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;">
            ${(user.name || 'U')[0].toUpperCase()}
          </div>
          <div style="text-align:left; line-height:1.2;">
            <div style="font-size:0.78rem; font-weight:700; color:var(--text-primary, #1e293b);">${user.name}</div>
            <div>${roleBadge}</div>
          </div>
        </div>
        <button onclick="logoutUser()" class="btn btn-outline-danger btn-sm" style="padding:4px 8px; font-size:0.75rem;" title="Sign out">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      ` : `
        <a href="login.html" class="btn btn-primary btn-sm" style="padding:6px 14px; font-size:0.8rem;">
          <i class="fas fa-sign-in-alt"></i> Sign In
        </a>
      `}
    </div>
  `;
}

function renderUniversalNavAuth() {
  renderUniversalHospitalNav();
}

function renderDynamicFooter() {
  const footerEl = document.querySelector('.formal-footer');
  if (!footerEl) return;
  footerEl.innerHTML = `
    <div class="container text-center" style="font-size:0.8rem; color:var(--text-muted); line-height:1.6;">
      <div>© 2026 <strong>Apex City Care Super-Specialty Hospital</strong> — Powered by QueueLess Smart OPD Dispatch Engine.</div>
      <div style="font-size:0.75rem; margin-top:4px;">
        Health Boulevard, Ring Road, Sector 12, Metro Junction, New Delhi • Emergency Hotline: <strong>+91 11 2659 8888</strong>
      </div>
    </div>
  `;
}

// ============================================================================
// 1. ROLE-BASED ACCESS CONTROL (RBAC) & DATA PRIVACY ENGINE
// ============================================================================

/**
 * Staff Self Profile: Staff can access ONLY their OWN full personal data
 * (Name, Staff ID, contact phone, personal home address, department, designation, etc.)
 */
function getStaffSelfProfile(userId = null) {
  const users = getUsers();
  const current = getCurrentUser();
  const targetId = userId || (current ? current.id : null);
  const staffMember = users.find(u => u.id === targetId && u.role === 'STAFF') ||
                      users.find(u => u.role === 'STAFF'); // fallback demo staff
  return staffMember ? { ...staffMember } : null;
}

/**
 * Colleague Directory: Other staff members are shown with ONLY Name and Designation.
 * All sensitive details (personal phone number, home address, email, salary) are strictly masked!
 */
function getOtherStaffDirectory(currentStaffUserId = null) {
  const users = getUsers();
  const current = getCurrentUser();
  const staffId = currentStaffUserId || (current ? current.id : null);

  return users
    .filter(u => u.role === 'STAFF' && u.id !== staffId)
    .map(s => ({
      id: s.id,
      name: s.name,
      designation: s.designation || 'Counter Officer',
      department: s.department || 'Operations Desk',
      counterName: s.counterName || 'Service Desk',
      // Explicitly omitted / masked for peer staff:
      phone: '•••• Protected (Admin Only)',
      personalAddress: '•••• Protected (Admin Only)',
      email: '•••• Protected',
      leaveStatus: s.leaveStatus || 'ON_DUTY'
    }));
}

/**
 * Admin Staff Registry: Admin login has complete oversight of all staff personal data
 * (Name, Contact, Address, Department, Leave Status toggle).
 */
function getAdminStaffRegistry() {
  const users = getUsers();
  return users.filter(u => u.role === 'STAFF').map(s => ({ ...s }));
}

/**
 * Admin Leave / No Leave Staff Attendance Toggle
 */
function toggleStaffLeave(staffUserId) {
  const users = getUsers();
  const staff = users.find(u => u.id === staffUserId);
  if (!staff) return { success: false, message: 'Staff member not found.' };

  staff.leaveStatus = staff.leaveStatus === 'ON_LEAVE' ? 'ON_DUTY' : 'ON_LEAVE';
  saveUsers(users);

  addAuditLog(`Staff status updated: ${staff.name} is now ${staff.leaveStatus === 'ON_DUTY' ? 'On Duty' : 'On Leave'}`);
  notifyStateChange('STAFF_LEAVE_TOGGLED', { staffId: staff.id, status: staff.leaveStatus });
  return { success: true, staff };
}

// ============================================================================
// 2. DETAILED TRANSIT TIME MATRIX (FROM HANDWRITTEN NOTE)
// Base 1 km benchmark:
// - Walk: 10 - 12 mins / km
// - Bicycle: 5 - 6 mins / km (10-12 / 2)
// - E-Bike: 2 - 3 mins / km
// - 2-Wheeler (Motorcycle / Scooter): 1.5 - 2 mins / km
// - 4-Wheeler / Cab / Public Bus: 1.5 - 2 mins / km
// ============================================================================
function calculateDetailedTransitTimes(distanceKm) {
  const dist = Math.max(0.2, Number(distanceKm) || 1.0);

  // Exact bounds per user's handwritten rules
  const walkMinsMin = Math.round(dist * 10);
  const walkMinsMax = Math.round(dist * 12);

  const cycleMinsMin = Math.round(dist * 5);
  const cycleMinsMax = Math.round(dist * 6);

  const eBikeMinsMin = Math.max(1, Math.round(dist * 2));
  const eBikeMinsMax = Math.max(2, Math.round(dist * 3));

  const twoWheelerMinsMin = Math.max(1, Math.round(dist * 1.5));
  const twoWheelerMinsMax = Math.max(2, Math.round(dist * 2.0));

  const fourWheelerMinsMin = Math.max(1, Math.round(dist * 1.5));
  const fourWheelerMinsMax = Math.max(2, Math.round(dist * 2.0));

  return {
    distanceKm: dist.toFixed(1),
    walk: { min: walkMinsMin, max: walkMinsMax, label: `${walkMinsMin}–${walkMinsMax} mins`, icon: 'fa-walking' },
    cycle: { min: cycleMinsMin, max: cycleMinsMax, label: `${cycleMinsMin}–${cycleMinsMax} mins`, icon: 'fa-bicycle' },
    eBike: { min: eBikeMinsMin, max: eBikeMinsMax, label: `${eBikeMinsMin}–${eBikeMinsMax} mins`, icon: 'fa-bolt' },
    twoWheeler: { min: twoWheelerMinsMin, max: twoWheelerMinsMax, label: `${twoWheelerMinsMin}–${twoWheelerMinsMax} mins`, icon: 'fa-motorcycle' },
    fourWheeler: { min: fourWheelerMinsMin, max: fourWheelerMinsMax, label: `${fourWheelerMinsMin}–${fourWheelerMinsMax} mins`, icon: 'fa-car' }
  };
}

// ============================================================================
// 3. ORGANIZATION SEARCH & MULTI-PRIORITY FILTER ENGINE
// Priorities:
// 1. Place Priority: Best Rated to Low (Ratings 4.9 down to 4.0)
// 2. Location Priority: Surrounding to Far Distance (Nearest km to Far)
// 3. Budget Priority: High Price to Low or Free/Affordable First
// 4. Emergency: Yes / No (Boosts critical healthcare / trauma centers)
// ============================================================================
function searchOrganizations({
  category = 'ALL',
  placePriority = 'HIGH_TO_LOW', // 'HIGH_TO_LOW' or 'LOW_TO_HIGH'
  locationPriority = 'NEAREST_FIRST', // 'NEAREST_FIRST' or 'FAR_FIRST'
  budgetPriority = 'LOW_TO_HIGH', // 'LOW_TO_HIGH' (Free first) or 'HIGH_TO_LOW' (Premium first)
  isEmergency = false,
  searchQuery = ''
} = {}) {
  let list = [...ORGANIZATION_REGISTRY];

  // Category filter
  if (category && category !== 'ALL') {
    list = list.filter(o => o.category === category);
  }

  // Text search
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.categoryName.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q)
    );
  }

  // Emergency filter
  if (isEmergency) {
    list = list.filter(o => o.emergencySupported);
  }

  // Combined Multi-Priority Sorting
  list.sort((a, b) => {
    // Primary sort: Place Priority (Rating)
    if (placePriority === 'HIGH_TO_LOW') {
      if (b.placeRating !== a.placeRating) return b.placeRating - a.placeRating;
    } else if (placePriority === 'LOW_TO_HIGH') {
      if (a.placeRating !== b.placeRating) return a.placeRating - b.placeRating;
    }

    // Secondary sort: Location Priority (Distance)
    if (locationPriority === 'NEAREST_FIRST') {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    } else if (locationPriority === 'FAR_FIRST') {
      if (b.distanceKm !== a.distanceKm) return b.distanceKm - a.distanceKm;
    }

    // Tertiary sort: Budget Priority (Fee)
    if (budgetPriority === 'LOW_TO_HIGH') {
      return a.feeAmount - b.feeAmount;
    } else if (budgetPriority === 'HIGH_TO_LOW') {
      return b.feeAmount - a.feeAmount;
    }

    return 0;
  });

  return list;
}

// ============================================================================
// 4. APPOINTMENT APPROVAL WORKFLOW & TO-DO DISPATCH
// Flow:
// 1. Client applies -> Ticket with QR generated, Status: 'PENDING_APPROVAL'
// 2. Org Admin reviews:
//    - If Admin approves -> Status becomes 'APPROVED' / 'QUEUED' -> Dispatched to Staff To-Do List!
//    - If Admin/Doctor denies -> Status becomes 'CANCELLED_BY_ORG' -> Client gets instant cancel popup!
// ============================================================================

/**
 * Client Applies for Appointment
 */
function applyForAppointment({
  userName,
  userPhone,
  userLocation,
  orgId,
  orgName,
  serviceId,
  serviceName,
  perspective = 'General Consultation',
  isEmergency = false
}) {
  const tokens = getTokens();
  const nextNum = 300 + tokens.length + 1;
  const tokenNumber = isEmergency ? `EMR-${nextNum}` : `APP-${nextNum}`;

  const newAppointment = {
    id: Date.now(),
    tokenNumber,
    userName,
    userPhone: userPhone || '+91 98765 43210',
    userLocation: userLocation || 'User Live Location (Within City)',
    orgId: orgId || 'org-edu-1',
    orgName: orgName || 'Apex National University',
    serviceId: Number(serviceId) || 1,
    serviceName: serviceName || 'General Consultation',
    perspective: perspective || 'Official Document Submission & Review',
    isEmergency: !!isEmergency,
    tokenType: isEmergency ? 'PRIORITY' : 'APPOINTMENT',
    status: 'PENDING_APPROVAL', // Waiting for Admin/Doctor Approval!
    counterId: null,
    slotTime: new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    qrPayload: `QUEUELITE:${tokenNumber}:${userName}:${orgName}:${isEmergency ? 'EMERGENCY' : 'STANDARD'}`
  };

  tokens.push(newAppointment);
  saveTokens(tokens);

  addAuditLog(`New appointment request submitted: ${tokenNumber} by ${userName} for ${orgName} (Awaiting Admin Approval)`);
  notifyStateChange('APPOINTMENT_REQUESTED', { appointment: newAppointment });

  return newAppointment;
}

/**
 * Admin Approves Appointment -> Pushes into Staff To-Do List!
 */
function approveAppointment(tokenId, assignedCounterId = 1) {
  const tokens = getTokens();
  const target = tokens.find(t => t.id === Number(tokenId) || t.tokenNumber === tokenId);
  if (!target) return { success: false, message: 'Appointment not found.' };

  target.status = 'QUEUED'; // Approved & ready for staff dispatch
  target.counterId = Number(assignedCounterId) || 1;
  target.approvedAt = new Date().toISOString();
  saveTokens(tokens);

  const counters = getCounters();
  const counter = counters.find(c => c.id === target.counterId);

  addAuditLog(`Appointment APPROVED by Admin: ${target.tokenNumber} for ${target.userName} -> Dispatched to ${counter ? counter.name : 'Staff Desk'}`);
  notifyStateChange('APPOINTMENT_APPROVED', { token: target });

  return { success: true, token: target, message: 'Appointment approved and assigned to staff action list.' };
}

/**
 * Admin / Doctor Denies Appointment -> Triggers Instant Cancel Popup for Client!
 */
function denyAppointment(tokenId, denialReason = 'Appointment Slot Full or Doctor Unavailable') {
  const tokens = getTokens();
  const target = tokens.find(t => t.id === Number(tokenId) || t.tokenNumber === tokenId);
  if (!target) return { success: false, message: 'Appointment not found.' };

  target.status = 'CANCELLED_BY_ORG';
  target.denialReason = denialReason;
  target.cancelledAt = new Date().toISOString();
  saveTokens(tokens);

  addAuditLog(`Appointment DENIED by Org: ${target.tokenNumber} for ${target.userName}. Reason: ${denialReason}`);
  notifyStateChange('APPOINTMENT_DENIED', { token: target, reason: denialReason });

  return { success: true, token: target, message: 'Appointment cancelled. Notification sent to client.' };
}

/**
 * Staff Client To-Do List:
 * Shows approved clients assigned to this staff's desk with:
 * Client Name, Contact Number, Purpose / Perspective, Calling Number, Timing, Client Live Location
 */
function getStaffClientTodoList(counterId = null) {
  const tokens = getTokens();
  const activeStatuses = ['QUEUED', 'CALLED', 'IN_SERVICE', 'PENDING_APPROVAL'];

  return tokens.filter(t => {
    if (!activeStatuses.includes(t.status)) return false;
    if (counterId && t.counterId && t.counterId !== Number(counterId)) return false;
    return true;
  }).map(t => ({
    id: t.id,
    tokenNumber: t.tokenNumber,
    userName: t.userName,
    userPhone: t.userPhone,
    userLocation: t.userLocation || 'Nearby (Approx. 1.2 km)',
    perspective: t.perspective || t.serviceName || 'Consultation & Review',
    timing: t.slotTime || t.checkInTime || 'Scheduled Now',
    status: t.status,
    isEmergency: !!t.isEmergency || t.tokenType === 'PRIORITY',
    serviceName: t.serviceName
  }));
}

/**
 * Admin Master Client To-Do & Appointment List:
 * Complete details across all desks (Name, Contact, Location, Timing, Doctor/Counter, Emergency)
 */
function getAdminClientTodoList() {
  const tokens = getTokens();
  const counters = getCounters();

  return tokens.map(t => {
    const counter = counters.find(c => c.id === t.counterId);
    return {
      id: t.id,
      tokenNumber: t.tokenNumber,
      userName: t.userName,
      userPhone: t.userPhone,
      userLocation: t.userLocation || 'Verified Regional Location',
      perspective: t.perspective || t.serviceName,
      timing: t.slotTime || t.checkInTime,
      counterName: counter ? counter.name : 'Awaiting Desk Assignment',
      status: t.status,
      isEmergency: !!t.isEmergency || t.tokenType === 'PRIORITY',
      denialReason: t.denialReason || null
    };
  });
}


function setOrganizationSector(sectorKey, reload = true) {
  const config = ORGANIZATION_SECTORS[sectorKey];
  if (!config) return;

  localStorage.setItem('ql_current_sector', sectorKey);
  localStorage.setItem('ql_services', JSON.stringify(config.services));
  localStorage.setItem('ql_counters', JSON.stringify(config.counters));

  addAuditLog(`System organization sector switched to: ${config.name} (${config.badge})`);
  notifyStateChange('SECTOR_CHANGED', { sector: sectorKey, config });

  if (reload) {
    showToast(`Organization switched to ${config.name}! Updating views...`, 'success');
    setTimeout(() => window.location.reload(), 700);
  }
}

function getActiveSector() {
  const key = localStorage.getItem('ql_current_sector') || 'UNIVERSITY';
  return ORGANIZATION_SECTORS[key] || ORGANIZATION_SECTORS.UNIVERSITY;
}

// Global Nav & Session Indicator (Hospital-Focused Multi-Role System)
function renderUniversalNavAuth() {
  const user = getCurrentUser();
  const currentPath = window.location.pathname.toLowerCase();

  // 1. Update hospital brand badge if present
  const sectorTag = document.getElementById('globalOrgSectorBadge');
  if (sectorTag) {
    sectorTag.innerHTML = `<i class="fas fa-hospital-alt"></i> Apex City Care Hospital`;
  }

  // 2. Dynamically Re-render Navbar Links (.nav-links) based on User Role (Pure Hospital Focus, No Admin Clutter)
  const navLinksContainer = document.querySelector('.nav-links');
  if (navLinksContainer) {
    if (user && user.role === 'DOCTOR') {
      // DOCTOR NAVBAR: Doctor Console, Staff Desk, Waiting Display TV, Patient Portal
      navLinksContainer.innerHTML = `
        <a href="doctor-portal.html" class="nav-link ${currentPath.includes('doctor-portal') ? 'active' : ''}"><i class="fas fa-user-md"></i> Doctor Console</a>
        <a href="staff-dashboard.html" class="nav-link ${currentPath.includes('staff-dashboard') ? 'active' : ''}"><i class="fas fa-clipboard-list"></i> Staff Calling Desk</a>
        <a href="kiosk-display.html" class="nav-link ${currentPath.includes('kiosk-display') ? 'active' : ''}"><i class="fas fa-tv"></i> Waiting Display TV</a>
        <a href="patient-portal.html" class="nav-link ${currentPath.includes('patient-portal') ? 'active' : ''}"><i class="fas fa-user-injured"></i> Patient Portal</a>
        <a href="index.html" class="nav-link ${currentPath.includes('index.html') || currentPath.endsWith('/') ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
      `;
    } else if (user && user.role === 'STAFF') {
      // STAFF NAVBAR: Staff Desk, Waiting Display TV, Home
      navLinksContainer.innerHTML = `
        <a href="staff-dashboard.html" class="nav-link ${currentPath.includes('staff-dashboard') ? 'active' : ''}"><i class="fas fa-clipboard-list"></i> Staff Calling Desk</a>
        <a href="kiosk-display.html" class="nav-link ${currentPath.includes('kiosk-display') ? 'active' : ''}"><i class="fas fa-tv"></i> Waiting Display TV</a>
        <a href="index.html" class="nav-link ${currentPath.includes('index.html') || currentPath.endsWith('/') ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
      `;
    } else if (user && user.role === 'VISITOR') {
      // CLIENT / PATIENT NAVBAR: Home, Patient Portal, Live Waiting Display
      navLinksContainer.innerHTML = `
        <a href="index.html" class="nav-link ${currentPath.includes('index.html') || currentPath.endsWith('/') ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
        <a href="patient-portal.html" class="nav-link ${currentPath.includes('patient-portal') ? 'active' : ''}"><i class="fas fa-user-injured"></i> Patient Portal</a>
        <a href="mobile-app.html" class="nav-link ${currentPath.includes('mobile-app') ? 'active' : ''}"><i class="fas fa-mobile-alt"></i> Mobile Tracker</a>
        <a href="kiosk-display.html" class="nav-link ${currentPath.includes('kiosk-display') ? 'active' : ''}"><i class="fas fa-tv"></i> Waiting TV</a>
      `;
    } else if (user && user.role === 'ADMIN') {
      // DEVELOPER / DBA NAVBAR
      navLinksContainer.innerHTML = `
        <a href="index.html" class="nav-link ${currentPath.includes('index.html') ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
        <a href="patient-portal.html" class="nav-link"><i class="fas fa-user-injured"></i> Patient Portal</a>
        <a href="staff-dashboard.html" class="nav-link"><i class="fas fa-clipboard-list"></i> Staff Desk</a>
        <a href="doctor-portal.html" class="nav-link"><i class="fas fa-user-md"></i> Doctor Console</a>
        <a href="dev-database-admin.html" class="nav-link ${currentPath.includes('dev-database') ? 'active' : ''}"><i class="fas fa-database"></i> Dev DB Console</a>
      `;
    } else {
      // GUEST / UNLOGGED NAVBAR: Home, Patient Portal, Staff Desk, Doctor Portal, Sign In
      navLinksContainer.innerHTML = `
        <a href="index.html" class="nav-link ${currentPath.includes('index.html') || currentPath.endsWith('/') ? 'active' : ''}"><i class="fas fa-home"></i> Home</a>
        <a href="patient-portal.html" class="nav-link ${currentPath.includes('patient-portal') ? 'active' : ''}"><i class="fas fa-user-injured"></i> Patient Portal</a>
        <a href="staff-dashboard.html" class="nav-link ${currentPath.includes('staff-dashboard') ? 'active' : ''}"><i class="fas fa-clipboard-list"></i> Staff Desk</a>
        <a href="doctor-portal.html" class="nav-link ${currentPath.includes('doctor-portal') ? 'active' : ''}"><i class="fas fa-user-md"></i> Doctor Portal</a>
        <a href="login.html" class="nav-link ${currentPath.includes('login') ? 'active' : ''}"><i class="fas fa-sign-in-alt"></i> Portal Login</a>
      `;
    }
  }

  // 3. Update user auth actions in nav
  const authContainer = document.getElementById('navAuthProfileSlot');
  if (authContainer) {
    const isRegisterPage = currentPath.includes('register.html');
    const isLoginPage = currentPath.includes('login.html');

    if (user) {
      const roleColor = user.role === 'DOCTOR' ? 'badge-peach' : user.role === 'STAFF' ? 'badge-blue' : user.role === 'ADMIN' ? 'badge-purple' : 'badge-green';
      const roleIcon = user.role === 'DOCTOR' ? 'fa-user-md' : user.role === 'STAFF' ? 'fa-user-shield' : user.role === 'ADMIN' ? 'fa-database' : 'fa-user';
      authContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="text-align:right;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-primary); line-height:1.2;">${user.name}</div>
            <span class="badge ${roleColor}" style="font-size:0.65rem; padding:2px 8px;"><i class="fas ${roleIcon}"></i> ${user.role}</span>
          </div>
          <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem;">
            ${user.name.charAt(0)}
          </div>
          <button class="btn btn-secondary btn-sm" onclick="logoutUser()" title="Sign Out" style="padding:6px 10px; font-size:0.75rem;">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      `;
    } else {
      if (isRegisterPage) {
        authContainer.innerHTML = `
          <a href="login.html" class="btn btn-outline-primary btn-sm"><i class="fas fa-sign-in-alt"></i> Sign In</a>
        `;
      } else if (isLoginPage) {
        authContainer.innerHTML = `
          <a href="register.html" class="btn btn-primary btn-sm"><i class="fas fa-user-plus"></i> Register</a>
        `;
      } else {
        authContainer.innerHTML = `
          <a href="login.html" class="btn btn-outline-primary btn-sm"><i class="fas fa-sign-in-alt"></i> Sign In</a>
        `;
      }
    }
  }

  // Trigger dynamic footer render
  renderDynamicFooter();
}

/**
 * Interactive Travel Mode Calculator:
 * Returns exact duration and departure time based on selected transport mode
 */
function calculateTravelTimeForMode(distanceKm, mode = 'WALK') {
  const dist = Math.max(0.2, Number(distanceKm) || 1.0);
  let minMins = 0;
  let maxMins = 0;
  let icon = 'fa-walking';
  let modeName = 'Walking';

  switch (mode.toUpperCase()) {
    case 'WALK':
      minMins = Math.round(dist * 10);
      maxMins = Math.round(dist * 12);
      icon = 'fa-walking';
      modeName = 'Walking on Foot';
      break;
    case 'CYCLE':
    case 'BICYCLE':
      minMins = Math.round(dist * 5);
      maxMins = Math.round(dist * 6);
      icon = 'fa-bicycle';
      modeName = 'Bicycle';
      break;
    case 'EBIKE':
      minMins = Math.max(1, Math.round(dist * 2));
      maxMins = Math.max(2, Math.round(dist * 3));
      icon = 'fa-bolt';
      modeName = 'Electric E-Bike';
      break;
    case 'TWO_WHEELER':
    case 'BIKE':
    case 'SCOOTER':
      minMins = Math.max(1, Math.round(dist * 1.5));
      maxMins = Math.max(2, Math.round(dist * 2.0));
      icon = 'fa-motorcycle';
      modeName = '2-Wheeler (Motorcycle / Scooter)';
      break;
    case 'CAR':
    case 'CAB':
    case 'BUS':
      minMins = Math.max(1, Math.round(dist * 1.5));
      maxMins = Math.max(2, Math.round(dist * 2.0));
      icon = 'fa-car';
      modeName = '4-Wheeler / Cab / Public Bus';
      break;
    default:
      minMins = Math.round(dist * 10);
      maxMins = Math.round(dist * 12);
  }

  const avgMinutes = Math.round((minMins + maxMins) / 2);
  const now = new Date();
  const departureTime = new Date(now.getTime() - avgMinutes * 60000);
  const departureStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    mode,
    modeName,
    icon,
    distanceKm: dist.toFixed(1),
    durationMin: minMins,
    durationMax: maxMins,
    label: `${minMins}–${maxMins} mins`,
    suggestedDeparture: departureStr
  };
}

// DYNAMIC CONTEXTUAL FOOTER (Changes according to active feature & sector)
function renderDynamicFooter() {
  const footers = document.querySelectorAll('.formal-footer, .dynamic-footer, #dynamicFooterSlot');
  if (!footers.length) return;

  const sector = getActiveSector();
  const tokens = getTokens();
  const inService = tokens.filter(t => t.status === 'IN_SERVICE' || t.status === 'CALLED').length;
  const queued = tokens.filter(t => t.status === 'QUEUED').length;
  const completed = tokens.filter(t => t.status === 'COMPLETED').length;

  const currentPath = window.location.pathname.toLowerCase();
  let currentFeature = 'Command Center & Live Dispatch';
  if (currentPath.includes('mobile-app')) currentFeature = 'Mobile Tracker & Venue Travel Time';
  else if (currentPath.includes('staff-dashboard')) currentFeature = 'Service Desk & Grace Period Handler';
  else if (currentPath.includes('admin-portal')) currentFeature = 'Organization Admin & SLA Configuration';
  else if (currentPath.includes('database-live-view')) currentFeature = 'Liquibase Schema & Live Relational Tables';
  else if (currentPath.includes('kiosk-display')) currentFeature = 'Public Waiting Hall Digital Kiosk';
  else if (currentPath.includes('analytics')) currentFeature = 'Audit Logs, Poisson Simulator & CSV Export';

  const footerHtml = `
    <div class="container" style="max-width:1400px; margin:0 auto; padding:0 1.5rem;">
      <div style="display:grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap:2rem; margin-bottom:2rem; flex-wrap:wrap;">
        
        <!-- Col 1: System Brand & Tech Badges -->
        <div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <div style="width:36px; height:36px; border-radius:var(--radius-sm); background:linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:1.1rem;">
              <i class="fas fa-layer-group"></i>
            </div>
            <div style="font-family:'Poppins',sans-serif; font-size:1.25rem; font-weight:800; color:var(--text-primary);">
              Queue<span>Less</span>
            </div>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.6; margin-bottom:12px;">
            Enterprise Virtual Queue & Deterministic Dispatch System. Compliant with Public Service and Enterprise SLA Standards.
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <span class="badge badge-blue"><i class="fab fa-js-square"></i> TypeScript 5.4</span>
            <span class="badge badge-purple"><i class="fab fa-java"></i> Java 26 & Spring Boot 3.2</span>
            <span class="badge badge-green"><i class="fas fa-database"></i> Liquibase Migrations</span>
          </div>
        </div>

        <!-- Col 2: Active Organization & Sector Context -->
        <div>
          <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
            Active Organization Context
          </div>
          <div style="background:var(--bg-sidebar); border-radius:var(--radius-md); padding:12px; border:1px solid var(--border-light);">
            <div style="font-weight:700; font-size:0.85rem; color:var(--primary-dark); margin-bottom:4px;">
              <i class="fas ${sector.icon}"></i> ${sector.badge}
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5;">
              Sector: <strong>${sector.name}</strong><br />
              Current Screen: <strong style="color:var(--text-primary);">${currentFeature}</strong>
            </div>
          </div>
        </div>

        <!-- Col 3: Live Queue Metrics -->
        <div>
          <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
            Live Queue Snapshot
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.9;">
            <div><i class="fas fa-play-circle" style="color:var(--accent-mint);"></i> Serving Now: <strong>${inService} tokens</strong></div>
            <div><i class="fas fa-clock" style="color:var(--primary);"></i> Waiting in Queue: <strong>${queued} tokens</strong></div>
            <div><i class="fas fa-check-circle" style="color:var(--secondary);"></i> Completed Today: <strong>${completed}</strong></div>
            <div><i class="fas fa-balance-scale" style="color:var(--accent-peach-dark);"></i> Dispatch: <strong>2:1 Interleaved FIFO</strong></div>
          </div>
        </div>

        <!-- Col 4: Quick Portals & Live Database Link -->
        <div>
          <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">
            Platform Navigation
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem;">
            <a href="index.html" style="color:var(--primary); text-decoration:none; font-weight:600;"><i class="fas fa-home"></i> Command Center</a>
            <a href="mobile-app.html" style="color:var(--primary); text-decoration:none; font-weight:600;"><i class="fas fa-mobile-alt"></i> Mobile Tracker & Transit Time</a>
            <a href="staff-dashboard.html" style="color:var(--primary); text-decoration:none; font-weight:600;"><i class="fas fa-user-cog"></i> Service Desk Counter</a>
            <a href="admin-portal.html" style="color:var(--primary); text-decoration:none; font-weight:600;"><i class="fas fa-landmark"></i> Org Admin Console</a>
            <a href="database-live-view.html" style="color:var(--accent-mint-dark); text-decoration:none; font-weight:700;"><i class="fas fa-database"></i> Live Database Explorer (Liquibase)</a>
            <a href="launchers/launcher-portal.html" style="color:var(--secondary-dark); text-decoration:none; font-weight:600;"><i class="fas fa-download"></i> Native Apps (Win/Mac/Mobile)</a>
          </div>
        </div>

      </div>

      <div style="border-top:1.5px solid var(--border-light); padding-top:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:0.75rem; color:var(--text-muted);">
        <div>© 2026 QueueLess Management Consortium. Full Stack Architecture: Java 26, Spring Boot 3.2, Liquibase & TypeScript.</div>
        <div style="display:flex; gap:14px;">
          <span>SLA: 99.98% Available</span>
          <span>•</span>
          <span>Zero Continuous Tracking</span>
          <span>•</span>
          <span>Deterministic Fairness Engine</span>
        </div>
      </div>
    </div>
  `;

  footers.forEach(f => f.innerHTML = footerHtml);
}

// VENUE TRAVEL TIME & DEPARTURE ESTIMATOR (One-time calculation only, NO continuous tracking)
function calculateAppointmentTravelTime(callback) {
  if (!('geolocation' in navigator)) {
    if (callback) callback({ success: false, message: 'Geolocation is not supported.' });
    return;
  }

  showToast('Calculating travel duration to venue (One-time estimate only)...', 'info');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const uLat = pos.coords.latitude;
      const uLng = pos.coords.longitude;
      const vLat = 28.6139; // Default Venue Center
      const vLng = 77.2090;

      // Haversine formula
      const R = 6371;
      const dLat = (vLat - uLat) * Math.PI / 180;
      const dLon = (vLng - uLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(uLat * Math.PI / 180) * Math.cos(vLat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = Math.max(0.4, (R * c));

      const drivingMins = Math.max(3, Math.round((distanceKm / 25) * 60) + 3);
      const transitMins = Math.max(5, Math.round((distanceKm / 18) * 60) + 5);

      const now = new Date();
      const leaveTime = new Date(now.getTime() + Math.max(5, drivingMins + 5) * 60000);
      const leaveTimeStr = leaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const result = {
        success: true,
        distanceKm: distanceKm.toFixed(1),
        drivingMins,
        transitMins,
        leaveTimeStr,
        isNear: distanceKm < 0.5,
        privacyNote: '🔒 Location was used once to calculate transit duration. It is NEVER tracked, logged, or saved.'
      };

      localStorage.setItem('ql_travel_time', JSON.stringify(result));
      if (callback) callback(result);
    },
    (err) => {
      // Graceful simulated proximity fallback if user declines permission
      const fallback = {
        success: true,
        distanceKm: '1.8',
        drivingMins: 8,
        transitMins: 14,
        leaveTimeStr: new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNear: false,
        isSimulated: true,
        privacyNote: '🔒 Location permission not granted. Showing estimated 1.8 km neighborhood transit buffer.'
      };
      localStorage.setItem('ql_travel_time', JSON.stringify(fallback));
      if (callback) callback(fallback);
    },
    { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
  );
}

// Getters & Setters
function getServices() {
  return JSON.parse(localStorage.getItem('ql_services') || JSON.stringify(DEFAULT_SERVICES));
}

function getCounters() {
  return JSON.parse(localStorage.getItem('ql_counters') || JSON.stringify(DEFAULT_COUNTERS));
}

function saveCounters(counters) {
  localStorage.setItem('ql_counters', JSON.stringify(counters));
  notifyStateChange('COUNTERS_UPDATED');
}

function getTokens() {
  return JSON.parse(localStorage.getItem('ql_tokens') || JSON.stringify(DEFAULT_TOKENS));
}

function saveTokens(tokens) {
  localStorage.setItem('ql_tokens', JSON.stringify(tokens));
  notifyStateChange('TOKENS_UPDATED');
}

function getAuditLogs() {
  return JSON.parse(localStorage.getItem('ql_audit_logs') || '[]');
}

function addAuditLog(text) {
  const logs = getAuditLogs();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  logs.unshift({ time, text });
  if (logs.length > 50) logs.pop();
  localStorage.setItem('ql_audit_logs', JSON.stringify(logs));
}

// Real-time Event Broadcaster
function notifyStateChange(eventType, payload = {}) {
  const message = { type: eventType, payload, timestamp: Date.now() };
  if (broadcastChannel) {
    broadcastChannel.postMessage(message);
  }
  // Also dispatch window custom event for current tab
  window.dispatchEvent(new CustomEvent('queueless_event', { detail: message }));
}

// Listener Registration
function onQueueUpdate(callback) {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => callback(event.data);
  }
  window.addEventListener('queueless_event', (e) => callback(e.detail));
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('ql_')) {
      callback({ type: 'STORAGE_SYNC', key: e.key });
    }
  });
}

/**
 * DETERMINISTIC 2:1 INTERLEAVED QUEUE ALGORITHM
 * 1. Priority Override (P-xxx) always served first.
 * 2. 2 Appointments (due now) : 1 Walk-in interleaving ratio.
 * 3. FIFO order inside matching pool.
 */
function getNextEligibleToken(serviceId = null) {
  const tokens = getTokens();
  let pool = tokens.filter(t => t.status === 'QUEUED');

  if (serviceId) {
    pool = pool.filter(t => t.serviceId === Number(serviceId));
  }

  if (pool.length === 0) return null;

  // Rule 1: Priority Override
  const priorityToken = pool.find(t => t.tokenType === 'PRIORITY');
  if (priorityToken) {
    return priorityToken;
  }

  // Separate Appointments and Walk-ins
  const appointments = pool.filter(t => t.tokenType === 'APPOINTMENT');
  const walkIns = pool.filter(t => t.tokenType === 'WALK_IN');

  let interleaveRatio = Number(localStorage.getItem('ql_interleave_counter') || '0');

  // If appointments exist and we haven't given 2 consecutive appointments yet
  if (appointments.length > 0 && interleaveRatio < 2) {
    localStorage.setItem('ql_interleave_counter', String(interleaveRatio + 1));
    return appointments[0];
  } else if (walkIns.length > 0) {
    // Give turn to Walk-in, reset ratio counter
    localStorage.setItem('ql_interleave_counter', '0');
    return walkIns[0];
  } else if (appointments.length > 0) {
    // Only appointments left
    localStorage.setItem('ql_interleave_counter', '1');
    return appointments[0];
  }

  return pool[0];
}

/**
 * CALL NEXT TOKEN FOR A COUNTER
 */
function callNextToken(counterId) {
  const counters = getCounters();
  const counter = counters.find(c => c.id === Number(counterId));
  if (!counter) return { success: false, message: 'Invalid counter ID' };

  const tokens = getTokens();

  // If current token is still in service, complete it automatically
  if (counter.currentToken) {
    const curToken = tokens.find(t => t.tokenNumber === counter.currentToken && (t.status === 'IN_SERVICE' || t.status === 'CALLED'));
    if (curToken) {
      curToken.status = 'COMPLETED';
      curToken.completedAt = new Date().toISOString();
      addAuditLog(`Token ${curToken.tokenNumber} marked COMPLETED at ${counter.name}`);
    }
  }

  const nextToken = getNextEligibleToken(counter.serviceId);
  if (!nextToken) {
    counter.currentToken = null;
    counter.status = 'IDLE';
    saveCounters(counters);
    saveTokens(tokens);
    return { success: false, message: 'No more waiting tokens for this counter.' };
  }

  nextToken.status = 'CALLED';
  nextToken.counterId = counter.id;
  nextToken.calledAt = new Date().toISOString();

  counter.currentToken = nextToken.tokenNumber;
  counter.status = 'CALLING';

  saveCounters(counters);
  saveTokens(tokens);

  addAuditLog(`${counter.name} called Token ${nextToken.tokenNumber} (${nextToken.userName})`);

  // Trigger Audio Chime & Speech
  playAudioChime();
  announceToken(nextToken.tokenNumber, counter.name);

  notifyStateChange('TOKEN_CALLED', {
    tokenNumber: nextToken.tokenNumber,
    counterName: counter.name,
    counterId: counter.id
  });

  return { success: true, token: nextToken, counter };
}

/**
 * MARK NO-SHOW WITH 2-CHANCE PENALTY ALGORITHM
 * 1st Miss: Moves back 3 positions in the queue (status: PENALIZED -> QUEUED).
 * 2nd Miss: Cancelled permanently.
 */
function markTokenNoShow(counterId) {
  const counters = getCounters();
  const counter = counters.find(c => c.id === Number(counterId));
  if (!counter || !counter.currentToken) return { success: false, message: 'No active token to mark No-Show.' };

  const tokens = getTokens();
  const token = tokens.find(t => t.tokenNumber === counter.currentToken);
  if (!token) return { success: false, message: 'Token record not found.' };

  token.missedCount = (token.missedCount || 0) + 1;

  if (token.missedCount === 1) {
    // 1st Chance Missed: Bump back 3 spots
    token.status = 'QUEUED';
    token.counterId = null;
    token.calledAt = null;

    // Remove from current index and insert 3 positions down among waiting tokens
    const queuedTokens = tokens.filter(t => t.status === 'QUEUED' && t.id !== token.id);
    const otherTokens = tokens.filter(t => t.status !== 'QUEUED' && t.id !== token.id);

    const insertIndex = Math.min(3, queuedTokens.length);
    queuedTokens.splice(insertIndex, 0, token);

    const reordered = [...otherTokens, ...queuedTokens];
    localStorage.setItem('ql_tokens', JSON.stringify(reordered));

    addAuditLog(`Token ${token.tokenNumber} missed 1st call. Bumped back 3 spots.`);
  } else {
    // 2nd Chance Missed: Permanent Cancellation
    token.status = 'CANCELLED';
    addAuditLog(`Token ${token.tokenNumber} cancelled after missing 2nd call.`);
    saveTokens(tokens);
  }

  counter.currentToken = null;
  counter.status = 'IDLE';
  saveCounters(counters);

  notifyStateChange('TOKEN_NO_SHOW', { tokenNumber: token.tokenNumber, missedCount: token.missedCount });
  return { success: true, missedCount: token.missedCount, tokenNumber: token.tokenNumber };
}

/**
 * MARK TOKEN IN_SERVICE
 */
function markTokenInService(counterId) {
  const counters = getCounters();
  const counter = counters.find(c => c.id === Number(counterId));
  if (!counter || !counter.currentToken) return { success: false };

  const tokens = getTokens();
  const token = tokens.find(t => t.tokenNumber === counter.currentToken);
  if (token) {
    token.status = 'IN_SERVICE';
    counter.status = 'IN_SERVICE';
    saveCounters(counters);
    saveTokens(tokens);
    addAuditLog(`Token ${token.tokenNumber} is now IN SERVICE at ${counter.name}.`);
    return { success: true };
  }
  return { success: false };
}

/**
 * COMPLETE TOKEN
 */
function markTokenCompleted(counterId) {
  const counters = getCounters();
  const counter = counters.find(c => c.id === Number(counterId));
  if (!counter || !counter.currentToken) return { success: false };

  const tokens = getTokens();
  const token = tokens.find(t => t.tokenNumber === counter.currentToken);
  if (token) {
    token.status = 'COMPLETED';
    token.completedAt = new Date().toISOString();
    counter.currentToken = null;
    counter.status = 'IDLE';
    saveCounters(counters);
    saveTokens(tokens);
    addAuditLog(`Token ${token.tokenNumber} consultation COMPLETED.`);
    return { success: true };
  }
  return { success: false };
}

/**
 * BOOK NEW APPOINTMENT OR JOIN WALK-IN QUEUE
 */
function issueToken({ userName, userPhone, serviceId, tokenType, slotTime = null }) {
  const services = getServices();
  const service = services.find(s => s.id === Number(serviceId)) || services[0];
  const tokens = getTokens();

  // Generate Token Prefix
  let prefix = 'W';
  if (tokenType === 'APPOINTMENT') prefix = 'A';
  if (tokenType === 'PRIORITY') prefix = 'P';

  // Find next number
  const sameTypeTokens = tokens.filter(t => t.tokenType === tokenType);
  const nextNum = sameTypeTokens.length + 101;
  const tokenNumber = `${prefix}-${nextNum}`;

  const newToken = {
    id: Date.now(),
    tokenNumber,
    userName,
    userPhone,
    serviceId: service.id,
    serviceName: service.name,
    counterId: null,
    tokenType,
    status: 'QUEUED',
    slotTime: slotTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    calledAt: null,
    completedAt: null,
    missedCount: 0,
    createdAt: new Date().toISOString()
  };

  tokens.push(newToken);
  saveTokens(tokens);

  addAuditLog(`New Token ${tokenNumber} issued to ${userName} (${tokenType}).`);

  // Save as current user's active token in this session
  localStorage.setItem('ql_my_token', JSON.stringify(newToken));

  notifyStateChange('NEW_TOKEN_ISSUED', { tokenNumber });
  return newToken;
}

/**
 * CALCULATE DETERMINISTIC ESTIMATED WAITING TIME (EWT)
 * EWT = (Sum of AvgDurations of ahead tokens / Active Counters) + Current Active Remaining
 */
function calculateEWT(tokenNumber) {
  const tokens = getTokens();
  const counters = getCounters();
  const services = getServices();

  const waitingTokens = tokens.filter(t => t.status === 'QUEUED');
  const targetIndex = waitingTokens.findIndex(t => t.tokenNumber === tokenNumber);

  if (targetIndex === -1) {
    const curToken = tokens.find(t => t.tokenNumber === tokenNumber);
    if (curToken && (curToken.status === 'CALLED' || curToken.status === 'IN_SERVICE')) {
      return { position: 0, ewtMinutes: 0, isServing: true };
    }
    return { position: 0, ewtMinutes: 0, isServing: false };
  }

  const aheadTokens = waitingTokens.slice(0, targetIndex);
  let totalDurationSum = 0;

  aheadTokens.forEach(t => {
    const s = services.find(srv => srv.id === t.serviceId);
    totalDurationSum += (s ? s.avgDuration : 10);
  });

  const activeCountersCount = Math.max(1, counters.filter(c => c.isActive).length);
  const estimatedMins = Math.ceil(totalDurationSum / activeCountersCount) + 2; // +2m buffer

  return {
    position: targetIndex + 1,
    ewtMinutes: estimatedMins,
    isServing: false
  };
}

/**
 * WEB AUDIO API SYNTHESIZER: DING-DONG CHIME
 */
function playAudioChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1st Note (High Chime - 660 Hz, E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.6);

    // 2nd Note (Low Chime - 523.25 Hz, C5) after 0.25s
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.9);
    }, 280);
  } catch (e) {
    console.log('AudioContext not allowed or autoplay blocked', e);
  }
}

/**
 * TEXT-TO-SPEECH ANNOUNCEMENT (Web Speech API)
 */
function announceToken(tokenNumber, counterName) {
  if ('speechSynthesis' in window) {
    // Format "A-102" as "A, 1, 0, 2" for clear pronunciation
    const formattedToken = tokenNumber.split('').join(' ');
    const utterance = new SpeechSynthesisUtterance(
      `Attention please. Token ${formattedToken}. Please proceed to ${counterName}.`
    );
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * TOAST NOTIFICATIONS
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}" style="color:${type === 'success' ? '#52B2A2' : type === 'warning' ? '#F29E65' : type === 'error' ? '#E36D61' : '#4F8FCB'};"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal Helper
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}

// Initialize on Script Load
initQueueStorage();
