
/**
 * 슬라이드
 * @param className
 * @param { Object } options
 * @returns {null}
 * @constructor
 */
const Slide = function (className, options) {
    const SLIDE_WRAP = ".slide__wrap";
    const SLIDE_INDICATOR = ".slide__indicator";
    const SLIDE_NAVIGATION = ".slide__nav";
    const SLIDE_NAVIGATION_NEXT = ".slide__nav__btn--next";
    const SLIDE_NAVIGATION_PREV = ".slide__nav__btn--prev";
    const SLIDE_ITEM_DUPLICATE = "slide__item__duplicate";
    const SLIDE_ITEM_DUPLICATE_NEXT = "slide__item__duplicate--next";
    const SLIDE_ITEM_DUPLICATE_PREV = "slide__item__duplicate--prev";

    this._options = [{
        autoSlide: false,
        duration: 3000,
        infinity: false,
        onResize: null,
        isNavigation: true,
        onOrientation: null
    }, options || {}].reduce(function (r, o) {
        Object.keys(o).forEach(function (k) {
            r[k] = o[k];
        });
        return r;
    }, {});

    const container = document.getElementsByClassName(className);

    if (container && container.length < 1) {
        return null;
    }

    // 변수 선언
    this.isShowNavigation = true;
    this._index = 0;
    this._real_index = 0;
    this._animate = false;
    this._touchX = 0;
    this._touchTime = 0;
    this._isMobile = false;
    this._isWebp = false;
    this._intervalId = null;
    this._container = container[0];
    this._wrap = this._container.querySelector(SLIDE_WRAP);
    this._indicator = this._container.querySelector(SLIDE_INDICATOR);
    this._navigation = this._container.querySelector(SLIDE_NAVIGATION);

    if (!this._wrap) {
        return null;
    }

    if (!this._indicator) {
        const indicator = document.createElement("div");
        indicator.classList.add("slide__indicator");
        this._container.appendChild(indicator);
        this._indicator = indicator;
    }

    if (!this._navigation) {
        const navigation = document.createElement("div");
        navigation.classList.add("slide__nav");
        const btnNext = document.createElement("div");
        btnNext.classList.add("slide__nav__btn");
        const btnPrev = btnNext.cloneNode(true);
        btnNext.classList.add("slide__nav__btn--next");
        btnPrev.classList.add("slide__nav__btn--prev");
        navigation.appendChild(btnNext);
        navigation.appendChild(btnPrev);
        this._container.appendChild(navigation);
        this._navigation = navigation;
    }

    this._real_count = this._wrap.childElementCount || 0;
    this._navNext = this._navigation.querySelector(SLIDE_NAVIGATION_NEXT);
    this._navPrev = this._navigation.querySelector(SLIDE_NAVIGATION_PREV);

    // 네비게이션 이벤트
    this._navNext.onclick = moveSlideNext.bind(this);
    this._navPrev.onclick = moveSlidePrev.bind(this);
    this._navNext.ontouchend = moveSlideNext.bind(this);

    const moveToSlide = moveSlide.bind(this);

    // 슬라이드 이동 이벤트
    this.moveToIndex = function (realIndex, animation) {
        const gap = (this._count - this._real_count) / 2

        if (this._index > this._real_count && realIndex > this._real_index) {
            moveToSlide(this._real_index + 1, false);
            this._index = realIndex + gap;
            this._real_index = realIndex;
            moveToSlide(this._index);
        } else if (this._index < 1 && realIndex < this._real_index) {
            moveToSlide(this._real_index + 1, false);
            this._index = realIndex + gap;
            this._real_index = realIndex;
            moveToSlide(this._index);
        } else if (realIndex > -1 && realIndex < this._real_count) {
            this._index = realIndex + gap;
            this._real_index = realIndex;
            moveToSlide(this._index, animation);
        }
    }

    // 슬라이드 trantition 이벤트
    this._wrap.addEventListener('transitionstart', function () {
        this._animate = true;
        moveToIndicator.call(this);
        checkNavigationButton.call(this);
    }.bind(this));
    this._wrap.addEventListener('transitionend', function () {
        this._animate = false;
        this._wrap.style.transitionDuration = "0ms";
    }.bind(this));
    // this._wrap.addEventListener('transitionrun', function () {
    // }.bind(this));

    // 슬라이드 터치 이벤트
    this._onTouchStart = onTouchStartSlide.bind(this);
    this._onTouchEnd = onTouchEndSlide.bind(this);
    this._onTouchMove = onTouchMoveSlide.bind(this);

    // 인디케이터 생성 및 index설정
    createIndicator.call(this);
    moveToIndicator.call(this);

    const width = this._wrap.offsetWidth;
    this._isMobile = this._options.mobile_width ? isMobile(width, this._options.mobile_width) : false;
    this.isShowNavigation = this._isMobile ? true : false;

    // 네비게이션 보이기/숨김 이벤트
    this.showNavigation = showNavigation.bind(this);

    checkScreenWidth.call(this);

    // 네이게이션바 초기에 보여기/숨김 처리
    if (this.isShowNavigation) {
        this.showNavigation(true);
    } else {
        this.showNavigation(false);
    }

    // 네비게이션 버튼 초기에 보이기/숨기기 설정
    checkNavigationButton.call(this);

    // 루프를 위한 처음과 끝에 복제 붙여넣기
    if (this._options.infinity) {
        const children = this._wrap.children;
        const first = children[0].cloneNode(true);
        const last = children[children.length - 1].cloneNode(true);

        first.classList.add(SLIDE_ITEM_DUPLICATE);
        first.classList.add(SLIDE_ITEM_DUPLICATE_NEXT);
        last.classList.add(SLIDE_ITEM_DUPLICATE);
        last.classList.add(SLIDE_ITEM_DUPLICATE_PREV);

        this._wrap.appendChild(first);
        this._wrap.insertBefore(last, children[0]);
    }

    this._count = this._wrap.childElementCount;
    this._index = (this._count - this._real_count) / 2;

    // 슬라이드 위치 초기화
    this._wrap.style.transform = "translate3d(-" + (width * this._index) + "px, 0px, 0px)";

    // 윈도우 리사이즈
    window.addEventListener("resize", onResize.bind(this));
    // 윈도우 회전
    window.addEventListener("orientationchange", onOrientation.bind(this));

    // 자동 슬라이드 설정
    if (this._options.autoSlide) {
        setSlideInterval.call(this, this._options.duration);

        this._container.addEventListener("mouseover", function (e) {
            clearSlideInterval.call(this);
        }.bind(this));
        this._container.addEventListener("mouseleave", function (e) {
            setSlideInterval.call(this, this._options.duration);
        }.bind(this));
    }
}

/**
 * 슬라이더 이동 이벤트
 * @param { number }index
 * @param { boolean } animation
 */
function moveSlide (index, animation) {
    const width = this._wrap.offsetWidth;
    const _animation = animation === undefined ? true : animation;

    if (_animation) {
        this._wrap.style.transitionDuration = "300ms";
    }
    this._wrap.style.transform = "translate3d(-" + (width * index) + "px, 0px, 0px)";
}

/**
 * 인디케이터 생성
 */
function createIndicator () {
    while ( this._indicator.hasChildNodes() ) { this._indicator.removeChild( this._indicator.firstChild ); }

    const div = document.createElement("div");
    div.classList.add("slide__indicator__item");

    for (let i = 0; i < this._real_count; i += 1) {
        const node = div.cloneNode(true);
        node.onclick = function (index) {
            this.moveToIndex(index);
        }.bind(this, i);
        this._indicator.appendChild(node);
    }
}

/**
 * 인디케이터 이동
 * @returns {null}
 */
function moveToIndicator () {
    const children = this._indicator.children;

    if (!this._indicator.hasChildNodes()) {
        return null;
    }

    const target = children[this._real_index];

    const active = this._indicator.querySelector(".active");

    if (active) {
        active.classList.remove("active");
    }

    if (target) {
        target.classList.remove("active");
        target.classList.add("active");
    }
}

/**
 * 슬라이더 처음으로 이동
 */
function moveSlideFirst() {
    if (!this._animate) {
        const gap = (this._count - this._real_count) / 2
        moveSlide.call(this, this._real_index + gap, false);
        this._index = this._real_index + (gap + 1);
        this._real_index = this._real_index + gap;
        moveSlide.call(this, this._index);
    }
}

/**
 * 슬라이더 마지막으로 이동
 */
function moveSlideLast() {
    if (!this._animate) {
        const gap = ((this._count - this._real_count) / 2) + 1
        moveSlide.call(this, this._count - gap, false);
        this._index = this._count - (gap + 1);
        this._real_index = this._real_count - gap;
        moveSlide.call(this, this._index);
    }
}

/**
 * 슬라이더 다음으로
 * @param e
 */
function moveSlideNext(e) {
    e.preventDefault();

    if (!this._animate) {
        if (this._index < this._count - 1) {
            moveSlide.call(this, this._index + 1);

            if (this._real_index < this._real_count - 1) {
                // 다음
                this._index += 1;
                this._real_index += 1;
            } else {
                // 마지막
                this._index += 1;
                this._real_index = 0;
            }
        } else if (this._options.infinity) {
            // 처음으로 루프
            moveSlideFirst.call(this);
        } else if (this._options.autoSlide && this._real_index === this._real_count - 1) {
            clearSlideInterval.call(this);
        }
    }
}

/**
 * 슬라이더 이전으로
 * @param e
 */
function moveSlidePrev(e) {
    e.preventDefault();

    if (!this._animate) {
        if (this._index > 0) {
            moveSlide.call(this, this._index - 1);

            if (this._real_index > 0) {
                this._index -= 1;
                this._real_index -= 1;
            } else {
                this._index -= 1;
                this._real_index = this._real_count - 1;
            }
        } else if (this._options.infinity) {
            // 마지막으로 루프
            moveSlideLast.call(this);
        }
    }
}

/**
 * 리사이즈 이벤트 함수
 */
function onResize() {
    moveSlide.call(this, this._index, false);

    checkScreenWidth.call(this);

    if (typeof this._options.onResize === "function") {
        this._options.onResize.call(this);
    }
}

/**
 * 회전 이벤트 함수
 */
function onOrientation() {
    moveSlide.call(this, this._index, false);

    if (typeof this._options.onOrientation === "function") {
        this._options.onOrientation.call(this);
    }
}

/**
 * 화면 크기 체크후 네이게이션 보이기/숨기기
 */
function checkScreenWidth () {
    if (this._options.mobile_width) {
        const width = window.innerWidth;
        this._isMobile = isMobile(width, this._options.mobile_width);

        if (this.isShowNavigation && this._isMobile) {
            changeImageType.call(this);
            this.showNavigation(false);
            this._wrap.addEventListener("touchstart", this._onTouchStart);
            this._wrap.addEventListener("touchend", this._onTouchEnd);
            this._wrap.addEventListener("touchmove", this._onTouchMove);
        } else if (!this.isShowNavigation && !this._isMobile){
            changeImageType.call(this);
            this.showNavigation(true);
            this._wrap.removeEventListener("touchstart", this._onTouchStart);
            this._wrap.removeEventListener("touchend", this._onTouchEnd);
            this._wrap.removeEventListener("touchmove", this._onTouchMove);
        }
    }
}

function isMobile(width, mobile_width) {
    return width < mobile_width + 1 ? true : false;
}

/**
 * 네비게이션 보이기/숨기기
 * @param { boolean } b - true: 보이기, false: 숨김
 */
function showNavigation(b) {
    this.isShowNavigation = b;
    if (b) {
        this._navigation.classList.remove("hide");
    } else {
        this._navigation.classList.add("hide");
    }
}

/**
 * 처음/끝 도달시 네비게이션 버튼 숨김
 */
function checkNavigationButton() {
    if (!this._options.infinity) {
        this._navNext.classList.remove("hide");
        this._navPrev.classList.remove("hide");

        if (this._real_index === this._real_count -1) {
            this._navNext.classList.add("hide");
        } else if (this._real_index < 1) {
            this._navPrev.classList.add("hide");
        }
    }
}

/**
 * 자동 슬라이드 interval 생성
 * @param time
 */
function setSlideInterval(time) {
    if (!this._intervalId) {
        this._intervalId = setInterval(moveSlideNext.bind(this), time);
    }
}

/**
 * 자동 슬라이드 interval 제거
 */
function clearSlideInterval() {
    if (this._intervalId) {
        this._intervalId = clearInterval(this._intervalId);
    }
}

/**
 * 이미지 타입 변경
 * @param isMobile
 */
function changeImageType() {
    const images = this._wrap.querySelectorAll(".slide__image");
    for (let i = 0; i < images.length; i += 1) {
        const item = images[i];
        const img = item.querySelector("img");
        img.src = img.getAttribute(this._isMobile ? "data-mobile" : "data-desktop");
    }
}

/**
 * 슬라이드 터치 시작 이벤트
 * @param e
 */
function onTouchStartSlide(e) {
    this._touchX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    this._touchTime = Date.now();
}

/**
 * 슬라이드 터치 끝 이벤트
 * @param e
 */
function onTouchEndSlide(e) {
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const width = this._wrap.offsetWidth;
    const std = width / 2;
    const posX = x - this._touchX;
    const time = Date.now();

    if (time - this._touchTime < 300) {
        if (posX > 0) {
            moveSlidePrev.call(this, e);
        } else if (posX < 0) {
            moveSlideNext.call(this, e);
        }
    } else if (Math.abs(posX) > std) {
        const moveIndex = Math.abs(Math.round(posX / width));
        moveSlide.call(this, moveIndex);
    } else {
        moveSlide.call(this, this._index);
    }
}

/**
 * 슬라이드 터치 이동 이벤트
 * @param e
 */
function onTouchMoveSlide(e) {
    e.preventDefault();

    if (!this._animate) {
        const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;

        const width = this._wrap.offsetWidth;
        const max = width * this._index;
        const posX = x - this._touchX;
        const px = posX + -max;

        if ((!this._options.loop && px > 0) || (!this._options.loop && Math.abs(px) > (width * (this._count - 1)) - 1)) {
            this._touchX = x;
        } else {
            this._wrap.style.transform = "translate3d(" + px + "px, 0px, 0px)";
        }
    }
}

function isWebp(callback) {
    const img = new Image();
    img.onerror = function () {
        this.is_webp = false;
        callback();
    }.bind(this);
    img.onload = function (){
        this.is_webp = true;
        callback();
    }.bind(this);
    img.src = 'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
}
