import requests
from requests.structures import CaseInsensitiveDict

from dotenv import load_dotenv
import os

load_dotenv()
GEOAPIFY_KEY = os.getenv('GEOAPIFY_KEY')

def get_lat_long(address):
    base_url = "https://api.geoapify.com/v1/geocode/search"
    
    headers = CaseInsensitiveDict()
    headers["Accept"] = "application/json"

    params = {
        "text": address,
        "apiKey": GEOAPIFY_KEY,
    }

    response = requests.get(base_url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        features = data.get("features", [])
        print(data)
        if features:
            first_result = features[0]
            coordinates = first_result["geometry"]["coordinates"]
            return coordinates
        else:
            return None
    else:
        print(f"Error: {response.status_code}")
        return None


# Example usage

# address = "1600 Amphitheatre Parkway, Mountain View, CA"
# coordinates = get_lat_long(address)

# if coordinates:
#     print(f"Latitude: {coordinates[1]}, Longitude: {coordinates[0]}")
# else:
#     print("Location not found.")