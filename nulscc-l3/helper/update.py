# Note: This is an outdated version
from random import randint
import requests
import json
BASE_URL = "http://127.0.0.1:4001/api/[PROJECT-ID]"
DB_URL = "[DB-URL]"  # Using restdb.io
DB_HEADER = {
    'content-type': "application/json",
    'x-apikey': "[API-KEY]",
    'cache-control': "no-cache"
}

lower_thirds = [
    "[WIDGET-ID1]",
    "[WIDGET-ID2]"
]

def fetch_participant_info(number: str):
    response = requests.request("GET", DB_URL+"/participants?q={\"Number\":"+number+"}", headers=DB_HEADER)
    if response.status_code != 200:
        return False
    result = json.loads(response.text)
    if len(result) != 1: return False
    return result[0]


def lower_third(numbers: list[str]):
    if len(numbers) == 0:
        for widget_id in lower_thirds:
            requests.post(BASE_URL+"/graphic/"+widget_id+"/update", {"status": "cuedoff"})
        return

    for num_i,num in enumerate(numbers):

        p_data = fetch_participant_info(num)
        if (not p_data):
            print("!! Invalid user: "+num)
            continue
        widget_id = lower_thirds[num_i]
        data = {
            "p_number": str(p_data["Number"]),
            "p_name": p_data["Name"],
            "p_info": (p_data["Category"] + " Category").upper(),
            "uni_name": p_data["University"][0]["Short Name"],
            "uni_logo": p_data["University"][0]["Logo"],
            "uni_colour": p_data["University"][0]["Colour"]
        }
        
        requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json={"data": data})

prompt = """\n\n=======Commands=======
L3 #1 #2       - Prepare lower thirds\n> """

in_data = input(prompt)
while in_data != "":
    if in_data[:2] == "L3":
        data = in_data[2:].strip()
        data_arr = data.split(" ") if len(data) > 0 else []
        lower_third(data_arr)

    in_data = input(prompt)