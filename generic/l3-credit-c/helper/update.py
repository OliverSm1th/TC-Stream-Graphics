import requests
from threading import Timer

BASE_URL = "http://127.0.0.1:4001/api/[PROJECT_ID]"
WIDGET_ID = "7YCWK"


def show_graphic(widget_id: str):
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", {"status": "cuedon"})
    Timer(0.5, lambda: requests.post(BASE_URL+"/graphic/"+widget_id+"/show")).start()

def hide_graphic(widget_id: str):
    requests.post(BASE_URL+"/graphic/"+widget_id+"/hide")

def update_graphic(widget_id: str, data: dict[str, str], useData=True):
    print(data)
    if (useData):
        j_data = {"data": data}
    else:
        j_data = data
    requests.post(BASE_URL+"/graphic/"+widget_id+"/update", json=j_data)



# in_data = input("")
# while(in_data != ""):