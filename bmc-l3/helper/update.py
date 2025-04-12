from random import randint
import requests
import json
from time import sleep
from threading import Timer
BASE_URL = "http://127.0.0.1:4001/api/ABCD"
DB_URL = "https://graphicsinfo-2abd.restdb.io/rest/"  # Using restdb.io
DB_HEADER = {
    'content-type': "application/json",
    'x-apikey': "67f9bc15c9da1e3012c663a8",
    'cache-control': "no-cache"
}

widgets = {
    "L": "U8060",
    "R": "6S8YG",
}
show_widgets = []
stby_widgets = []
tags = []

def fetch_participant_info(number: str):
    response = requests.request("GET", DB_URL+"/participants?q={\"Number\":"+number+"}", headers=DB_HEADER)
    if response.status_code != 200:
        return False
    result = json.loads(response.text)
    if len(result) != 1: return False
    return result[0]

def toggle_graphic(widget_id: str):
    if widget_id in show_widgets:
        hide_graphic(widget_id)
        show_widgets.remove(widget_id)
    else:
        show_graphic(widget_id)
        show_widgets.append(widget_id)

def show_graphic(widget_id: str):
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", {"status": "cuedon"})
    Timer(0.5, lambda: requests.post(BASE_URL+"/graphic/"+widget_id+"/show")).start()

def hide_graphic(widget_id: str):
    requests.post(BASE_URL+"/graphic/"+widget_id+"/hide")

def toggle_stndby_graphic(widget_id: str):
    if widget_id in stby_widgets:
        unstandby_graphic(widget_id)
        stby_widgets.remove(widget_id)
    else:
        standby_graphic(widget_id)
        stby_widgets.append(widget_id)

def standby_graphic(widget_id: str):
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", {"status": "cuedon"})

def unstandby_graphic(widget_id: str):
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", {"status": "cuedoff"})

def update_graphic(widget_id: str, data: dict[str, str]):
    print(data)
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json={"data": data})

def search_participant_num(number: int):
    response = requests.request("GET", DB_URL+"/participants?q={\"Number\":"+str(number)+"}", headers=DB_HEADER)
    if response.status_code != 200:  return False
    result = json.loads(response.text)
    if len(result) != 1: return False
    return result[0]

def search_participant_name(name: str):
    response = requests.request("GET", DB_URL+"/participants?q={\"Name\":"+name+"}", headers=DB_HEADER)
    if response.status_code != 200:  return False
    result = json.loads(response.text)
    if len(result) != 1: return False
    return result[0]

def update_participant(widget_id: str, p_data):
    if(p_data == False): return False
    data = {
            "p_number": str(p_data["Number"]),
            "p_name": p_data["Name"],
            # "uni_name": p_data["University"][0]["Short Name"],
            # "uni_logo": p_data["University"][0]["Logo"],
            # "uni_colour": p_data["University"][0]["Colour"]
        }
    if ("Type" in p_data):
        data["p_info"] = (p_data["Type"] + " Category").upper()
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json={"data": data})


prompt = """=======Commands=======
_ _ _ _     - Show/hide widget(s)
_s          - Standby widget
_t 10.23    - Set time + show in widget
_t          - Hide time in widget
_p [type]   - Show previous time in widget ("[type] time")
_p          - Show/hide previous time
_i [text]   - Set info
_c [colour] - Set colour
_g [text]   - Add tag
_g #        - Remove tag #
_p ##       - Set participant by number
_p [name]   - Set participant by name (search)
> """

in_data = input(prompt)
while(in_data != ""):
    print("\n\n")
    in_arr = in_data.strip().split(" ")
    if(len(in_arr[0]) == 1):    # Show/hide widgets
        print(in_arr)
        for x in in_arr:
            if(not x.upper() in widgets): continue
            toggle_graphic(widgets[x.upper()])
        in_data = input(prompt)
        continue
    if not in_arr[0][0] in widgets:
        in_data = input(prompt)
        continue
    widget = widgets[in_arr[0][0]]
    option    = in_arr[0][1]
    params = in_arr[1:]
    if (option == "s"):
        toggle_stndby_graphic(widget)
    elif (option == "i"):
        update_graphic(widget, {'p_info': ' '.join(params)})
    elif (option == "g"):
        if (params[0].isnumeric()):
            if (int(params[0]) <= len(tags)):
                del tags[int(params[0])-1]
            else:
                print("Invalid number")
                in_data = input(prompt)
                continue
        else:
            print("appending")
            tags.append(' '.join(params))
        print(tags)
        update_graphic(widget, {'p_tags': ','.join(tags)})

    elif (option == "p"):
        if params[0].isnumeric():
            p = search_participant_num(int(params[0]))
        else:
            p = search_participant_name(params[0])
        if (not p): 
            print("Nothing found")
        else:
            update_participant(widget, p)

    in_data = input(prompt)




# while in_data != "":
    # if in_data[:2] == "L3":
    #     data = in_data[2:].strip()
    #     data_arr = data.split(" ") if len(data) > 0 else []
    #     lower_third(data_arr)

    # in_data = input(prompt)