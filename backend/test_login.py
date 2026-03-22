import requests

url = "http://localhost:8000/verify/qr"
payload = {"qr_code": "ZVB2600799"}
headers = {"Content-Type": "application/json"}

try:
    print(f"Testing POST {url} ...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
