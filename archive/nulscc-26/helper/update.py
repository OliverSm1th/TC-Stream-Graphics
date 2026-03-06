# BUGS:
# - Problem with the previous time - didn't want to work :(
# - Sometimes showed an empty graphic for some reason
# - Doesn't remove the tags when it switches to a new participant, has to be manually removed using _g 1 etc

import gspread
from random import randint
import requests
import json
from time import sleep
from threading import Timer

gc = gspread.oauth()
SHEET = gc.open_by_key("1DUxV-AXe9BIT1edVa4nxugsVYXUZaXqphhQZeJoLQ8c")
SHEET_SETUP = SHEET.get_worksheet(0)
SHEET_LEAD_S = SHEET.get_worksheet(2)  # Lead Scores
SHEET_SPEED_S = SHEET.get_worksheet(3)  # Speed Scores
SHEET_C_LEADERBOARD = SHEET.get_worksheet(4)
SHEET_LEADERBOARD = SHEET.get_worksheet(5)
SHEET_SPEED_F = SHEET.get_worksheet(6)
SHEET_TC_GUIDANCE = SHEET.get_worksheet(8)
PROJECT_ID = "ABCD"
BASE_URL = f"http://127.0.0.1:4001/api/{PROJECT_ID}"

# TODO:
# - Test
# - Work on leaderboard
#   - Specify area to get data from
#   - Highlight specific row
#   - Change highlight colour
# - Change participant colour

# Update the widget ids from H2R Graphics:
widgets = {
    "L": "K4ACF",
    "M": "YSPA9",
    "R": "PHKAY",
    "T": "NHP0F",
    # "B": "7H0VY",
    # "W": "YQIHO",
    # "C": "3R0E9"
}
show_widgets = []
stby_widgets = []
# tags = {

# }
time_tag_i = {

}
prev_time_tag_i = {
    
}
widget_participant = {

}
title_t = ""
title_s = ""

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
    return SHEET_SETUP.row_values(number+1)

def search_participant_name(name: str):
    # TODO
    cell = SHEET_SETUP.find(name, in_column=2)
    if(cell == None):
        return False
    return SHEET_SETUP.row_values(cell.row)


def update_participant(widget_id: str, p_data):
    if(p_data == False): return False
    data = {
            "p_number": str(p_data[0]),
            "p_name": p_data[1],
            "p_info": "",
            "p_extra": "",
            "uni_id": p_data[2]
            # "uni_name": p_data["University"][0]["Short Name"],
            # "uni_logo": p_data["University"][0]["Logo"],
            # "uni_colour": p_data["University"][0]["Colour"]
        }
    if(len(p_data[3]) > 0) {
        data["p_info"] = (('Open' if p_data[3] == 'M' else 'Female') + " Category").upper()
    }
    # tags[widget_id] = []
    if ("Type" in p_data):
        
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json={"data": data})

prompt = """=======Commands=======
_ _ _ _     - Show/hide widget(s)
_s          - Standby widget
_p ##       - Set participant by number
_p [name]   - Set participant by name (search)
_i [text]   - Set info
_e [text]   - Set extra
_u [ID]     - Set uni
_c [colour] - Set colour
> """
# _p [type]   - Show previous time in widget ("[type] time")
# _p          - Show/hide previous time
# _g [text]   - Add tag
# _g #        - Remove tag #
# _t 10.23    - Set time + show in widget
# _t          - Hide time in widget


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
    if (widget_c[0] == "T"):
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
    elif (option == "i"):
        update_graphic(widget, {'p_info': ' '.join(params)})
    elif (option == "e"):
        update_graphic(widget, {'p_extra': ' '.join(params)})
    elif (option == "u"):
        result = SHEET_SETUP.find(query=params[0], in_column=8)
        if(result == None):
            result = SHEET_SETUP.find(query=params[0], in_column=9)
            if(result != None):
                update_graphic(widget, {'p_uni': SHEET_SETUP.row_values(result.row)[7]})
        else:
            update_graphic(widget, {'p_uni': params[0]})
    elif (option == "p"):
        print("Searching...")
        if params[0].isnumeric():
            p = search_participant_num(int(params[0]))
        else:
            p = search_participant_name(params[0])
            if (not p): 
                print("Nothing found")
        widget_participant[widget_c] = p[0]
        update_participant(widget, p)

    in_data = input(prompt)




# while in_data != "":
    # if in_data[:2] == "L3":
    #     data = in_data[2:].strip()
    #     data_arr = data.split(" ") if len(data) > 0 else []
    #     lower_third(data_arr)

    # in_data = input(prompt)