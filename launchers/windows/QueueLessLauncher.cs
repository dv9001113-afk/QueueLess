using System;
using System.Diagnostics;
using System.IO;

namespace QueueLessApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string targetPath = Path.Combine(appDir, "..", "..", "index.html");
            if (!File.Exists(targetPath))
            {
                targetPath = Path.Combine(appDir, "index.html");
            }

            string fullTarget = Path.GetFullPath(targetPath);

            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath))
            {
                edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
            }

            if (File.Exists(edgePath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = "--app=\"file:///" + fullTarget.Replace('\\', '/') + "\"",
                    UseShellExecute = true
                });
            }
            else
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = fullTarget,
                    UseShellExecute = true
                });
            }
        }
    }
}
