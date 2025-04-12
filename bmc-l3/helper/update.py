# BUGS:
# - Problem with the previous time - didn't want to work :(
# - Sometimes showed an empty graphic for some reason
# - Doesn't remove the tags when it switches to a new participant, has to be manually removed using _g 1 etc

from random import randint
import requests
import json
from time import sleep
from threading import Timer
BASE_URL = "http://127.0.0.1:4001/api/[PROJECT_ID]"
DB_URL = "https://[DB_URL]/rest/"  # Using restdb.io
DB_HEADER = {
    'content-type': "application/json",
    'x-apikey': "[API_KEY]",
    'cache-control': "no-cache"
}

# Update the widget ids from H2R Graphics:
widgets = {
    "L": "7YCWK",
    "M": "K1FQC",
    "R": "K93E4",
    "T": "NHP0F",
    "B": "7H0VY",
    "W": "YQIHO",
    "C": "3R0E9"
}
show_widgets = []
stby_widgets = []
tags = {

}
time_tag_i = {

}
prev_time_tag_i = {
    
}
widget_participant = {

}
title_t = ""
title_s = ""

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

def update_graphic(widget_id: str, data: dict[str, str], useData=True):
    print(data)
    if (useData):
        j_data = {"data": data}
    else:
        j_data = data
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json=j_data)

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

def set_prev_time(number: int, time: str):
    print("Settings prev time")
    response = requests.request("GET", DB_URL+"/participants?q={\"Number\":"+str(number)+"}", headers=DB_HEADER)
    response_arr = json.loads(response.text)
    if (len(response_arr) == 0): return False
    data = response_arr[0]
    data["prev_time"] = time
    
    response = requests.request("PUT", DB_URL+"/participants/"+data["_id"], data=json.dumps(data), headers=DB_HEADER)
    print(response)
    print(response.text)

def update_participant(widget_id: str, p_data):
    if(p_data == False): return False
    data = {
            "p_number": str(p_data["Number"]),
            "p_name": p_data["Name"],
            "p_tags": ""
            # "uni_name": p_data["University"][0]["Short Name"],
            # "uni_logo": p_data["University"][0]["Logo"],
            # "uni_colour": p_data["University"][0]["Colour"]
        }
    tags[widget_id] = []
    if ("Type" in p_data):
        data["p_info"] = (p_data["Type"] + " Category").upper()
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json={"data": data})

def add_prev_time(widget_c: str, number: int):
    data = search_participant_num(number)
    if (not "prev_time" in data): return False
    prev_time_tag_i[widget_c] = add_tag(widget_c, "Prev: "+data["prev_time"])
def remove_prev_time(widget_c: str):
    if (not widget_c in prev_time_tag_i):
        print("Previous time not shown")
        return
    remove_tag(widget_c, prev_time_tag_i[widget_c])


def toggle_prev_time(widget_c: str):
    if (widget_c in prev_time_tag_i):
        return remove_prev_time(widget_c)
    else:
        if (not widget_c in widget_participant):
            return False
        return add_prev_time(widget_c, widget_participant[widget_c])

def add_tag(widget_c: str, new_tag):
    if (widget_c in tags):
        tags[widget_c].append(new_tag) 
    else:
        tags[widget_c] = [new_tag]
    update_graphic(widgets[widget_c], {'p_tags': ','.join(tags[widget_c])})
    return len(tags[widget_c])-1

def remove_tag(widget_c: str, tag_i: int):
    if (not(widget_c in tags)): return False
    if(tag_i >= len(tags[widget_c])): return False
    del tags[widget_c][tag_i]
    update_graphic(widgets[widget_c], {'p_tags': ','.join(tags[widget_c])})


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
    widget_c = in_arr[0][0]
    widget = widgets[widget_c]
    option    = in_arr[0][1]
    params = in_arr[1:]
    if (widget_c == "T"):
        print("Updating Title...")
        if (len(params) > 0):
            if (option == 't'):
                title_t = ' '.join(params)
            else:
                title_s = ' '.join(params)
            data = {"line_one":title_t, "line_two":title_s}
            update_graphic(widget, data, False)
        in_data = input(prompt)
        continue
    if (option == "s"):
        toggle_stndby_graphic(widget)
    elif (option == "t"):
        if (len(params) > 0):
            time = params[0].zfill(4)
            time_tag_i[widget_c] = add_tag(widget_c, f"Time: {time}")
            if (widget_c in widget_participant):
                set_prev_time(widget_participant[widget_c], time)
            else:
                print("No participant set")
        elif (widget_c in time_tag_i):
            remove_tag(widget_c, time_tag_i[widget_c])
            del time_tag_i[widget_c]
        else:
            print("No time shown")
    elif (option == "i"):
        update_graphic(widget, {'p_info': ' '.join(params)})
    elif (option == "g"):
        if (params[0].isnumeric()):
            remove_tag(widget_c, int(params[0])-1)
        else:
            add_tag(widget_c, ' '.join(params))
    elif (option == "p"):
        if (len(params) == 0):
            toggle_prev_time(widget_c)
            print("Adding previous")
            in_data = input(prompt)
            continue
        print("Searching...")
        if params[0].isnumeric():
            p = search_participant_num(int(params[0]))
        else:
            p = search_participant_name(params[0])
            if (not p): 
                print("Nothing found")
        widget_participant[widget_c] = p["Number"]
        update_participant(widget, p)
            

    in_data = input(prompt)




# while in_data != "":
    # if in_data[:2] == "L3":
    #     data = in_data[2:].strip()
    #     data_arr = data.split(" ") if len(data) > 0 else []
    #     lower_third(data_arr)

    # in_data = input(prompt)