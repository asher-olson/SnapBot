import requests
from bs4 import BeautifulSoup
from contextlib import closing
from selenium.webdriver import Chrome
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
import time
import json
from PIL import Image

def scrape():
    url_start = "https://snap.fan/cards/?page=" 

    cards = {}

    with closing(Chrome()) as driver:
        for i in range(9):
            url = f"{url_start}{i+1}"
            driver.get(url)
            wait_for_ajax(driver)
            
            soup = BeautifulSoup(driver.page_source, "html.parser")

            divs = list(map(lambda x: x.parent, soup.find_all("a", class_="d-block")))

            for div in divs:
                name = div.find("a")["href"].split("/")[2].lower()
                # print(name)

                img_url = div.find("img", class_="game-card-image__img")["src"]
                img = requests.get(img_url).content
                with open(f"../images/{name}.webp", "wb") as f:
                    f.write(img)

                img_jpg = Image.open(f"../images/{name}.webp").convert("RGB")
                img_jpg.save(f"../images/{name}.jpg", "jpeg")

                ability = div.find("div", class_="small").text
                print(ability)

                cards[name] = {"name": name, "ability": ability, "jpg_url": f"/images/{name}.jpg", "webp_url": f"/images/{name}.webp"}

            # get cost and power
            # https://snap.fan/cards/?costs=
            # https://snap.fan/cards/?powers=

    # print(cards)
    with open("../cards.json", "w") as f:
        obj = json.dumps(cards, indent = 4)
        f.write(obj)


def wait_for_ajax(driver):
    wait = WebDriverWait(driver, 15)
    try:
        wait.until(lambda driver: driver.execute_script('return jQuery.active') == 0)
        wait.until(lambda driver: driver.execute_script('return document.readyState') == 'complete')
    except Exception as e:
        pass

scrape()