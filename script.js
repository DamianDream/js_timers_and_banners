
const count = document.querySelector('.js-count');
const notificationClose = document.querySelector('.js-notification-close');
const showOrderButton = document.querySelector('.js-show-order');
const popupOrder = document.querySelector('.js-popup-order');
const popupCart = document.querySelector('.js-popup-cart');
const productWrapper = document.querySelector('.js-product-list');
const saleEndDate = '2022-12-31';
// const saleEndDate = '2022-12-31';


notificationClose.addEventListener('click', hideNotification);
showOrderButton.addEventListener('click', () => {
    hidePopupCart();
    showPopupOrder();
})
popupCart.querySelector('.js-popup-close').addEventListener('click', () => hidePopup(popupCart));
popupOrder.querySelector('.js-popup-close').addEventListener('click', () => hidePopup(popupOrder));

async function getGoods() {
    let url = 'https://my-json-server.typicode.com/OlhaKlymas/json-lesson/goods';
    let response = await fetch(url);
    return await response.json();
}

getGoods().then(response => new Promise((resolve, reject) => {
    if (response.length !== 0) {
        resolve(response);
    } else {
        reject('Помилка');
    }
}).then(
    result => {
        if (productWrapper) showProducts(result);
        count.addEventListener('click', () => showPopupCart(result));
    })
    .then(() => {
        let products = document.querySelectorAll('.js-product');
        if (productWrapper && products.length) {
            setAddToCartHandler(products);
            setRemoveToCartHandler(products);
            checkDeleteIcon();
        }
    })
    .then(() => {
        addSaleTimerHtmlElement();
        saleTimeInterval();
    })
    .catch(error => console.log(error.message))
    .finally(console.log("Done")));

setCounter();

function showProducts(goods) {
    goods.forEach(item => {
        const article = document.createElement('article');
        article.classList.add('product-list__item', 'tile');
        article.classList.add('js-product');
        article.setAttribute('data-id', item.id);

        article.innerHTML = `
        <a href="?${item.id}" class="tile__link">
            <span class="tile__top">
                <span class="tile__badge tile__badge--${item.badge}">${item.badge}</span>
                <span class="tile__delete js-tile-delete hidden"> 
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_6043_11153)">
                        <path d="M2.03125 3.85352H12.9687" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.753 3.85352V12.3605C11.753 12.9681 11.1454 13.5757 10.5378 13.5757H4.46137C3.85373 13.5757 3.24609 12.9681 3.24609 12.3605V3.85352" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.06934 3.85341V2.63813C5.06934 2.03049 5.67697 1.42285 6.28461 1.42285H8.71517C9.32281 1.42285 9.93045 2.03049 9.93045 2.63813V3.85341" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_6043_11153">
                        <rect width="14.5833" height="14.5833" fill="white" transform="translate(0.208008 0.208008)"/>
                        </clipPath>
                        </defs>
                    </svg>
                </span>
            </span>
            <span class="tile__image">
                <img src="${item.images[0].preview}" alt="${item.title}">
            </span>
            <span class="tile__title">${item.title}</span>
            <span class="tile__info">
            <span class="tile__price">
                <span class="tile__old-price">${item.price.old} ₴</span>
                <span class="tile__new-price">${item.price.current} ₴</span>
            </span>
                <button class="btn">Купити</button>
            </span>
        </a>
    `;
        productWrapper.appendChild(article);
    });
}

function setCounter() {
    let currentArrey = localStorage.getItem('cart')?.split(', ');
    count.textContent = currentArrey?.length;
}

function checkDeleteIcon() {
    if (localStorage.getItem('cart')) {
        let currentArrey = localStorage.getItem('cart')?.split(', ');
        currentArrey.forEach(item => {
            const element = document.querySelector(`[data-id="${item}"] .tile__delete`);
            element.classList.remove('hidden');
        });
    }
}

function setAddToCartHandler(products) {
    products.forEach(product => {
        product.addEventListener('click', (e) => {
            e.preventDefault();
            let currentValueCard = localStorage.getItem('cart');

            if (e.target.classList.contains('btn')) {

                if (currentValueCard) {
                    currentValueCard += ', ' + e.currentTarget.dataset.id;
                } else {
                    currentValueCard = e.currentTarget.dataset.id;
                }
                localStorage.setItem('cart', currentValueCard);
                showNotification(e.currentTarget, 'Додано в корзину');
            }
            setCounter();
            checkDeleteIcon();
        })
    })
}

function setRemoveToCartHandler(products) {
    products.forEach(item => {
        let bucket = item.querySelector('.js-tile-delete');
        bucket.addEventListener('click', (e) => {
            e.currentTarget.classList.add('hidden');
            let parent = e.target.closest('.js-product');
            let id = parent.dataset.id;
            let currentArrey = localStorage.getItem('cart')?.split(', ');
            let newCurrent = currentArrey.filter(item => {
                return item !== id;
            })
            if (newCurrent.length == 0) {
                localStorage.removeItem('cart');
            } else {
                localStorage.setItem('cart', newCurrent.join(', '));
            }
            showNotification(parent, 'Видалено з корзини');
        })
    })
}

function showNotification(item, text) {
    let notification = document.querySelector('.js-notification');
    notification.classList.add('notification--active');
    let title = item.querySelector('.tile__title').innerText;
    let content = notification.querySelector('.js-notification-content');
    content.innerHTML = '';
    let p = document.createElement('p');
    p.innerText = title + ' ' + text;
    content.appendChild(p);
}

function hideNotification() {
    let notification = document.querySelector('.js-notification');
    notification.classList.remove('notification--active');
}

function showPopupCart(goods) {
    let currentArrey = localStorage.getItem('cart')?.split(', ');
    if (currentArrey?.length > 0) {
        popupCart.classList.add('popup--active');
        let list = document.querySelector('.js-popup-cart-list');

        goods.forEach(item => {
            if (currentArrey.includes(String(item.id))) {
                const li = document.createElement('li');
                li.classList.add('popup-cart__list-item', 'cart-item');

                li.innerHTML = `
                <span class="cart-item__img">
                    <img src="https://content2.rozetka.com.ua/goods/images/preview/250024064.jpg" alt="Капсули для прання Persil Power Caps Колір Doy 70 шт. (9000101536591)">
                </span>
                <span class="cart-item__info">
                    <a href="https://rozetka.com.ua/ua/persil-9000101536591/p333692440/" class="cart-item__link">
                        <span class="cart-item__title">Капсули для прання Persil Power Caps Колір Doy 70 шт. (9000101536591)</span>
                        <span class="cart-item__price">
                            <span class="tile__count">2 шт</span>
                            <span class="tile__price">Вартість - 500 ₴</span>
                            <span class="tile__total-price">Сума - 1000 ₴</span>
                        </span>
                    </a>
                </span>
                <span class="cart-item__remove">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_6043_11153)">
                        <path d="M2.03125 3.85352H12.9687" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.753 3.85352V12.3605C11.753 12.9681 11.1454 13.5757 10.5378 13.5757H4.46137C3.85373 13.5757 3.24609 12.9681 3.24609 12.3605V3.85352" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.06934 3.85341V2.63813C5.06934 2.03049 5.67697 1.42285 6.28461 1.42285H8.71517C9.32281 1.42285 9.93045 2.03049 9.93045 2.63813V3.85341" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_6043_11153">
                        <rect width="14.5833" height="14.5833" fill="white" transform="translate(0.208008 0.208008)"/>
                        </clipPath>
                        </defs>
                    </svg>
                </span>
            `;
                list.appendChild(li);
            }

        });
    }
}

function hidePopup(popup) {
    popup.classList.remove('popup--active');
}

function showPopupOrder() {
    popupOrder.classList.add('popup--active');
}


// !  SALE TIMER

function getSaleTimeRemaining(date) {

    let now = new Date();
    let then = new Date(date);

    const t = then.getTime() - now.getTime(),
        days = Math.floor((t / (1000 * 60 * 60 * 24))),
        hours = Math.floor((t / (1000 * 60 * 60) % 24)),
        minutes = Math.floor((t / 1000 / 60) % 60),
        seconds = Math.floor((t / 1000) % 60); // для наглядности

    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds,
        addZero(num) {
            if (num >= 0 && num < 10) {
                return '0' + num;
            } else {
                return num;
            }
        },
        get text() {
            return `${this.addZero(this.days)} : 
            ${this.addZero(this.hours)} : 
            ${this.addZero(this.minutes)} : 
            ${this.addZero(this.seconds)}`;
        }
    };
}

function getSaleEndDateToText(date) {
    return `Акція діє до ${date.split('-').reverse().join('.')}`;
}

function createSaleInfoElement() {
    const saleSpan = document.createElement('span');
    saleSpan.classList.add('tile__sale-info', 'sale');

    saleSpan.innerHTML = `
        <span class="sale__text">${getSaleEndDateToText(saleEndDate)}</span>
        <span class="sale__counter">${getSaleTimeRemaining(saleEndDate).text}</span>
    `;
    return saleSpan;
}


function addSaleTimerHtmlElement() {
    const saleTiles = document.querySelectorAll('.tile__badge--sale');

    saleTiles.forEach(el => {
        const parentContainer = el.closest('a');
        const target = parentContainer.querySelector('.tile__title');

        target.after(createSaleInfoElement());
    });
}

function updateTimer() {
    const t = getSaleTimeRemaining(saleEndDate);
    const timer = document.querySelectorAll('.sale__counter');

    if (t.total <= 0) {
        timer.forEach(element => {
            element.innerHTML = "Акція закінчилась!";
        });
        clearInterval(saleInterval);
    } else {
        timer.forEach(element => {
            element.innerHTML = `${t.text}`;
        });
    }
}


function saleTimeInterval() {
    const t = getSaleTimeRemaining(saleEndDate);
    let saleInterval = setInterval(() => {
        updateTimer();
    }, 1000);

    if (t.total <= 0) {
        clearInterval(saleInterval);
    }
}

// ! SALL BANNER
const jsSaleBanner = document.querySelector('.js-sale-banner');

if (getCurrDateInMillisecond() > +localStorage.getItem('bannerNextShowDate')) {
    startBannerTimmer();
}

function getCurrDateInMillisecond() {
    return new Date().getTime();
}

function activateSaleBannerCloseButton() {
    document.querySelector('.js-sale-banner-close')
        .addEventListener('click', () => {
            switchSaleBanner(jsSaleBanner);
            setBannerNexDate();
        });
}

function switchSaleBanner(el) {
    if (el.style.display === 'flex') {
        el.style.display = 'none';
    } else {
        el.style.display = 'flex';
    }
}

function startBannerTimmer() {
    setTimeout(() => {
        switchSaleBanner(jsSaleBanner);
        activateSaleBannerCloseButton();
    }, 3000);
}

function setBannerNexDate() {
    let sevenDays = 1000 * 60 * 60 * 24 * 7; // для наглядности
    let bannerNewDate = new Date().getTime() + sevenDays;
    localStorage.setItem('bannerNextShowDate', bannerNewDate);
}