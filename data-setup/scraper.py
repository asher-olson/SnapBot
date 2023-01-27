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

GET_VARIANTS = True;

def scrape():
    url_start = "https://snap.fan/cards/?page=" 

    cards = {}
    card_urls = []  # save individual urls for later to clean up variant categories that have 1 card

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
                name = div.find("a")["href"].split("/")[2].replace("Mr", "Mister")  # add more replacing if they add ms/miss marvel or some shit
                id = name.lower()
                url = div.find("a")["href"]
                card_urls.append((id, url))

                img_url = div.find("img", class_="game-card-image__img")["src"]
                img = requests.get(img_url).content
                with open(f"../images/{id}.webp", "wb") as f:
                    f.write(img)

                img_jpg = Image.open(f"../images/{id}.webp").convert("RGB")
                img_jpg.save(f"../images/{id}.jpg", "jpeg")

                ability = div.find("div", class_="small").text

                cards[id] = {"id": id, "name": name, "ability": ability, "jpg_path": f"./images/{id}.jpg", "webp_path": f"./images/{id}.webp", "variant_paths": []}

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
                name = div.find("a")["href"].split("/")[2].lower().replace("mr", "mister")
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
                name = div.find("a")["href"].split("/")[2].lower().replace("mr", "mister")
                cards[name]['power'] = power

        # get variants
        if GET_VARIANTS:
            driver.get("https://snap.fan/cards/variants/")
            wait_for_ajax(driver)

            soup_ = BeautifulSoup(driver.page_source, "html.parser")

            links = list(map(lambda x: x['href'], soup_.find_all("a", class_="d-block")))

            for link in links:
                category = link.split("/")[3].replace("%20", " ")
                
                page = 1
                while True:
                    driver.get(f"https://snap.fan{link}?page={page}")
                    page += 1
                    wait_for_ajax(driver)

                    soup = BeautifulSoup(driver.page_source, "html.parser")

                    images = soup.find_all("img", class_="game-card-image__img")

                    if(len(images) == 0):
                        break

                    for image in images:
                        name = image.parent.parent['data-variant-key'].split("_")[0].lower().replace("mr", "mister")

                        img = requests.get(image['src']).content
                        var_extension = category.replace(" ", "-")
                        with open(f"../images/{name}_{var_extension}.webp", "wb") as f:
                            f.write(img)

                        var = {"name": category, "path": f"./images/{name}_{var_extension}.webp"}

                        cards[name]["variant_paths"].append(var)  

            # clean up variant categories that only have 1 card
            for url in card_urls:
                driver.get(f"https://snap.fan{url[1]}")
                wait_for_ajax(driver)

                soup = BeautifulSoup(driver.page_source, "html.parser")

                name = soup.find("h1", class_="text-break").text[:-17]
                print(name)
                cards[url[0]]["name"] = name

                divs = soup.find_all("div", class_="card-variant-gallery__card")

                for div in divs:
                    link = div.find("div", class_="card-variant-gallery__card-content").find_all("div", class_="card-variant-gallery__card-value")[1].find("a")
                    if link is None:
                        continue

                    var_name = link.text
                    var_path = f"./images/{url[0]}_{var_name.replace(' ', '-')}.webp"
                    
                    # list(map(lambda x: x['path'], cards[url[0]]["variant_paths"]))
                    if var_path not in list(map(lambda x: x['path'], cards[url[0]]["variant_paths"])):
                        driver.get(f"https://snap.fan{link['href']}")
                        wait_for_ajax(driver)

                        soup2 = BeautifulSoup(driver.page_source, "html.parser")

                        src = soup2.find("img", class_="game-card-image__img")["src"]

                        img = requests.get(src).content
                        with open(f".{var_path}", "wb") as f:
                            f.write(img)

                        var = {"name": var_name, "path": var_path}

                        cards[url[0]]["variant_paths"].append(var) 



    with open("../cards.json", "w") as f:
        obj = json.dumps(cards, indent = 4)
        f.write(obj)


def wait_for_ajax(driver):
    wait = WebDriverWait(driver, 15)
    print("waiting")
    try:
        wait.until(lambda driver: driver.execute_script('return jQuery.active') == 0)
        wait.until(lambda driver: driver.execute_script('return document.readyState') == 'complete')
        print("done waiting")
    except Exception as e:
        pass

scrape()