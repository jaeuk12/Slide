# HTML Layout
```
<div class="slide__container">
    <div class="slide__wrap">
        <div class="slide__item">
            <a href="/ko/page/sale190822_all">
                <picture class="slide__image">
                    <img
                        data-desktop="@image_path_desktop"
                        data-mobile="@image_path_mobile"
                        alt=""
                    >
                </picture>
            </a>
        </div>
    </div>
    <div class="slide__indicator">
    </div>
    <div class="slide__nav">
        <div class="slide__nav__btn slide__nav__btn--next"></div>
        <div class="slide__nav__btn slide__nav__btn--prev"></div>
    </div>
</div>
```

# Slide Script
```
const slide = new Slide("slide__container", {
    mobile_width: 640, // 모바일 크기로 변하는 사이즈
    infinity: false, // 반복
    autoSlide: false, // 자동 슬라이드
    duration: 3000 // 자동슬라이드 지연시간
});
```

# 그 외
> * 자동 슬라이드 상태에서 슬라이드로 마우스 올렸을시 자동슬라이드 멈춥니다
> 슬라이드에서 마우스가 벗어나면 다시 작동합니다.
>
> * 무한순환 하지 않을시 처음/끝 도달시 네비게이션 숨김 처리 하였습니다.
