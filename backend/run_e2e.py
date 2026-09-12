import subprocess
import sys
import time

def main():
    print("Launching Uvicorn server on http://127.0.0.1:8000...")
    server = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        # Give server time to initialize
        time.sleep(2)

        print("Executing end-to-end P2P verification script...")
        test_run = subprocess.run(
            [sys.executable, "verify_p2p_transfer.py"],
            capture_output=False,
        )

        if test_run.returncode == 0:
            print("\nE2E P2P Transfer test SUCCEEDED!")
        else:
            print(f"\nE2E P2P Transfer test FAILED with code {test_run.returncode}")

        sys.exit(test_run.returncode)
    finally:
        print("Stopping Uvicorn test server...")
        server.terminate()
        server.wait()

if __name__ == "__main__":
    main()
