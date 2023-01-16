import requests
from bs4 import BeautifulSoup
from contextlib import closing
from selenium.webdriver import Chrome
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
import json
from PIL import Image

def scrape():
    url_start = "https://snap.fan/cards/?page=" 

    cards = {}

    with closing(Chrome()) as driver:
        # get image name and ability from main cards page
        page = 0
        while True:
            url = f"{url_start}{page+1}"
            page += 1
            driver.get(url)
            wait_for_ajax(driver)
            
            soup = BeautifulSoup(driver.page_source, "html.parser")

            divs = list(map(lambda x: x.parent, soup.find_all("a", class_="d-block")))

            if(len(divs) == 0):
                break

            for div in divs:
                name = div.find("a")["href"].split("/")[2].lower()

                img_url = div.find("img", class_="game-card-image__img")["src"]
                img = requests.get(img_url).content
                with open(f"../images/{name}.webp", "wb") as f:
                    f.write(img)

                img_jpg = Image.open(f"../images/{name}.webp").convert("RGB")
                img_jpg.save(f"../images/{name}.jpg", "jpeg")

                ability = div.find("div", class_="small").text

                cards[name] = {"name": name, "ability": ability, "jpg_path": f"./images/{name}.jpg", "webp_path": f"./images/{name}.webp"}

        # get cost
        cost_url_start = "https://snap.fan/cards/?costs="
        cost = 0
        page = 1
        while True:
            if cost >= 10:  # update if they add a card that costs 10+
                break

            url = f"{cost_url_start}{cost}&page={page}"
            page += 1
            driver.get(url)
            wait_for_ajax(driver)

            soup = BeautifulSoup(driver.page_source, "html.parser")

            divs = list(map(lambda x: x.parent, soup.find_all("a", class_="d-block")))

            if(len(divs) == 0):
                cost += 1
                page = 1

            for div in divs:
                name = div.find("a")["href"].split("/")[2].lower()
                cards[name]['cost'] = cost

        # get power
        power_url_start = "https://snap.fan/cards/?powers="
        power = 0
        page = 1
        while True:
            if power >= 21:  # update if they add a card that is bigger than infinaut
                break

            url = f"{power_url_start}{power}&page={page}"
            page += 1
            driver.get(url)
            wait_for_ajax(driver)

            soup = BeautifulSoup(driver.page_source, "html.parser")

            divs = list(map(lambda x: x.parent, soup.find_all("a", class_="d-block")))

            if(len(divs) == 0):
                power += 1
                page = 1

            for div in divs:
                name = div.find("a")["href"].split("/")[2].lower()
                cards[name]['power'] = power

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