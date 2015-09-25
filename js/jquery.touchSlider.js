$(document).ready(function () {
    $.fn.touchSlider = function (options) {
        //settings 
        var settings = $.extend({}, $.fn.touchSlider.defaultOptions, options);
        var SliderControl = {
            initialize: function (sliderWrap) {
                this.sliderWrap = sliderWrap;
                this.createDOMElements();

                this.attachHandlers();

                return this;
            },

            createDOMElements: function () {
                this.sliderWrap.html("");
                this.sliderWrap.addClass(settings.sliderWrapClass);

                this.sliderBG = this.appendDivElement(settings.sliderBGClass);
                this.sliderWrap.append(this.sliderBG);

                this.sliderRange = this.appendDivElement(settings.sliderRangeClass);
                this.sliderWrap.append(this.sliderRange);

                this.sliderRoad = this.appendDivElement(settings.sliderRoadClass);
                this.sliderBG.append(this.sliderRoad);

                this.sliderOutput = this.appendDivElement(settings.sliderOutputClass);
                this.sliderWrap.append(this.sliderOutput);

                this.slider1 = this.appendDivElement(settings.sliderItemClass + " slider-1").attr("data-result", "result-1");
                this.sliderRoad.append(this.slider1);

                if (this.hasSecondSlider) {
                    this.slider2 = this.appendDivElement(settings.sliderItemClass + " slider-2").attr("data-result", "result-2");
                    this.sliderRoad.append(this.slider2);
                }

                this.sliderResult = this.appendDivElement(settings.sliderResultClass);
                this.sliderOutput.append(this.sliderResult);

                this.stepList = this.appendDOMElement("ul", settings.sliderStepClass);
                this.sliderBG.append(this.stepList);

                if (this.minPosition === 0 || this.minPosition % this.step !== 0)
                    this.minPosition = this.min;
                if (this.hasSecondSlider)
                    if (this.maxPosition === 0 || this.maxPosition % this.step !== 0)
                        this.maxPosition = this.max;


                this.minPositionIndex = this.calcCount(this.minPosition);
                this.lastValue.push(this.arrStepValues[this.minPositionIndex]);

                if (this.hasSecondSlider) {
                    this.maxPositionIndex = this.calcCount(this.maxPosition);
                    this.lastValue.push(this.arrStepValues[this.maxPositionIndex]);
                }
                this.loadResponsiveVariables();
                this.oneStepWidthPercent = this.oneStepWidth / this.width * 100;
                this.setRangePosition();

                this.countCircles = this.calcCount(this.max);


                if ($.isFunction(settings.load)) {
                    this.minPosition = this.arrStepValues[this.minPositionIndex];
                    this.maxPosition = this.arrStepValues[this.maxPositionIndex];
                    settings.load.call(this, this.hasSecondSlider ? [this.minPosition, this.maxPosition] : [this.minPosition]);
                }

                this.setCSSLeft(this.slider1, this.minPositionIndex * this.oneStepWidthPercent + "%");
                this.setSliderResult(this.slider1, this.minPositionIndex);

                if (this.hasSecondSlider) {
                    this.isFirstSlider = false;
                    this.setCSSLeft(this.slider2, this.maxPositionIndex * this.oneStepWidthPercent + "%");
                    this.setSliderResult(this.slider2, this.maxPositionIndex);
                }

                this.setSliderFocus(this.slider1);

                this.stepList.append('<li class="step even ' + this.arrStepValues[0]
                    + '" data-index="0"><span><i>' + this.arrStepValues[0] +
                    (this.customLabels.suffix ? ' ' + this.customLabels.suffix : '') + '</i></span></li>');

                for (var i = 1, isOdd = true; i <= this.countCircles; i++, isOdd = !isOdd) {
                    this.stepList.append('<li class="step ' + (isOdd ? 'odd' : 'even') + ' '
                        + this.arrStepValues[i] + '" data-index="' + i + '"><span><i>'
                        + this.arrStepValues[i] + '</i></span></li>');
                }

                this.stepElements = this.stepList.find('li i');

                this.setStepActiveForInit(this.slider1, this.minPositionIndex);

                if (this.hasSecondSlider)
                    this.setStepActiveForInit(this.slider2, this.maxPositionIndex);

                this.stepList.children('li').each(function (index) {
                    SliderControl.stepPos = index * SliderControl.oneStepWidthPercent;

                    SliderControl.setCSSLeft($(this), SliderControl.stepPos + "%")
                });

            },

            attachHandler: function (element, touchType, handler, options) {
                touchType = touchType || 'tap';

                $(element).hammer(options || {}).on(touchType, handler);
            },

            attachHandlers: function () {

                var sliderExcessLeft = parseFloat(this.slider1.outerWidth() / 2) + this.sliderWrapOffsetLeft;
                var isSliderRelease = true;
                var dragElem;
                SliderControl.lastPos.left = [SliderControl.minPositionIndex * SliderControl.oneStepWidth, SliderControl.maxPositionIndex * SliderControl.oneStepWidth];
                SliderControl.lastPos.index = [SliderControl.minPositionIndex, SliderControl.maxPositionIndex];

                $(window).resize(function () {
                    SliderControl.loadResponsiveVariables();
                    sliderExcessLeft = parseFloat(SliderControl.slider1.outerWidth() / 2) + SliderControl.sliderWrapOffsetLeft;
                });

                this.attachHandler(this.sliderRoad.children(), 'drag', function (ev) {
                    ev.gesture.preventDefault();
                    if (isSliderRelease) {
                        SliderControl.setSliderFocus($(this));

                        dragElem = SliderControl.sliderFocusedItem;

                        isSliderRelease = false;
                    }

                    SliderControl.renderEachDrag(ev, dragElem);
                });

                this.attachHandler(this.sliderBG, 'drag', function (ev) {
                    ev.gesture.preventDefault();

                    if (isSliderRelease) {
                        if (SliderControl.hasSecondSlider) {
                            var currentLeftPos = ev.gesture.touches[0].pageX - SliderControl.sliderWrap.offset().left;
                            var currentPos = currentLeftPos - $(this).position().left;

                            var slider1Left = parseFloat(SliderControl.slider1.css('left'));
                            var slider2Left = parseFloat(SliderControl.slider2.css('left'));

                            if (currentPos < slider1Left) {
                                SliderControl.setSliderFocus(SliderControl.slider1);
                            } else if (currentPos > slider2Left || (Math.abs(currentPos - slider1Left) > Math.abs(currentPos - slider2Left))) {
                                SliderControl.setSliderFocus(SliderControl.slider2);
                            } else {
                                SliderControl.setSliderFocus(SliderControl.slider1);
                            }
                        }
                        dragElem = SliderControl.sliderFocusedItem;

                        isSliderRelease = false;
                    }

                    SliderControl.renderEachDrag(ev, dragElem);
                });

                this.attachHandler(this.sliderBG, 'release', function (ev) {
                    if (!isSliderRelease) {
                        SliderControl.changeSliderPositionComplete(SliderControl.sliderFocusedItem, SliderControl.dragIndex);
                        isSliderRelease = true;
                    }
                });

                this.attachHandler(this.sliderBG, 'tap', function (ev) {
                    ev.gesture.preventDefault();

                    if (!isSliderRelease) return; //disabled when below list item tapped
                    var targetLeft = ev.gesture.touches[0].pageX - SliderControl.sliderWrap.offset().left;
                    var currentPos = targetLeft - $(this).position().left;
                    var index = Math.round(targetLeft / SliderControl.oneStepWidth);

                    if (SliderControl.hasSecondSlider) {

                        if (currentPos < parseFloat(SliderControl.slider1.css('left'))) {
                            SliderControl.setSliderFocus(SliderControl.slider1);
                        } else if (currentPos > parseFloat(SliderControl.slider2.css('left'))) {
                            SliderControl.setSliderFocus(SliderControl.slider2);
                        }

                    }
                    SliderControl.dragIndex = SliderControl.setSliderResult(SliderControl.sliderFocusedItem, index).index;

                    isSliderRelease = false;
                });

                this.attachHandler(this.stepList.children('li'), 'tap', function (ev) {
                    ev.gesture.preventDefault();
                    if (SliderControl.hasSecondSlider) {

                        if ($(this).index() < SliderControl.minPositionIndex) {
                            SliderControl.setSliderFocus(SliderControl.slider1);
                        } else if ($(this).index() > SliderControl.maxPositionIndex) {
                            SliderControl.setSliderFocus(SliderControl.slider2);
                        }
                    }
                    var targetLeft = parseInt($(this).css('left'));
                    var index = Math.round(targetLeft / SliderControl.oneStepWidth);

                    SliderControl.dragIndex = SliderControl.setSliderResult(SliderControl.sliderFocusedItem, index).index;

                    isSliderRelease = false;
                })
            },

            loadResponsiveVariables: function () {
                this.width = parseFloat(this.stepList.width());

                this.oneStepWidth = this.width / (this.max - this.min) * this.step;

                SliderControl.sliderWrapOffsetLeft = SliderControl.sliderWrap.offset().left;
            },

            calcCount: function (max) {
                return (max - this.min) / this.step;
            },

            renderEachDrag: function (ev, dragElem) {
                var dragX = ev.gesture.deltaX;

                var targetLeft = (this.lastPos.index[this.isFirstSlider ? 0 : 1] * this.oneStepWidth + dragX);
                var index = Math.round(targetLeft / this.oneStepWidth);

                if (index < 0) index = 0;
                if (index >= this.countCircles) index = this.countCircles;

                this.dragResult = (this.dragResult.index != index) ? this.setSliderResult(dragElem, index) : this.dragResult;

                this.dragIndex = this.dragResult.index;
                this.dragResult.index = index;


                if (this.dragResult.hasCollision) return;
                this.setAltLabels();

                if (!this.hasSliderOutput) {
                    this.setStepActive(dragElem, this.dragIndex, false);
                }

                if (targetLeft >= 0 && targetLeft < this.width) {
                    if (this.hasSliderOutput)
                        if (this.hasSecondSlider) {
                            this.sliderRange.css(this.isFirstSlider ?
                            {'left': (targetLeft + 25)} :
                            {'right': (this.width - targetLeft + 25)});
                        } else {
                            this.sliderRange.css({'right': (this.width - targetLeft + 25)});
                        }
                    this.setTranslateX(dragElem, dragX);
                }
            },

            setSliderResult: function (slider, index) {
                var sliderIndex, hasCollision = false;

                if (index < 0 || index == null)
                    index = 0;
                else if (index > this.countCircles)
                    index = this.countCircles;
                this.isFirstSlider = $(slider).hasClass('slider-1');

                if (this.isFirstSlider) {
                    if (this.hasSecondSlider && index >= this.maxPositionIndex) {
                        index = this.maxPositionIndex - 1;
                        hasCollision = true;
                    }
                    this.minPositionIndex = index;

                    sliderIndex = 0;
                } else {
                    if (this.hasSecondSlider && index <= this.minPositionIndex) {
                        index = this.minPositionIndex + 1;
                        hasCollision = true;
                    }

                    this.maxPositionIndex = index;

                    sliderIndex = 1;
                }

                this.lastValue[sliderIndex] = this.arrStepValues[index];

                var text;

                if ((this.minPositionIndex == 0) && (this.maxPositionIndex == this.arrStepValues.length - 1)) {
                    //If initial position, use custom label
                    text = this.customLabels.initial;
                }

                if (!text) {
                    text = this.lastValue[0] + ((this.hasSecondSlider) ? ' - ' + this.lastValue[1] : '');

                    if (this.customLabels.prefix && (this.minPositionIndex != this.arrStepValues.length - 1)) {
                        text = this.customLabels.prefix + ' ' + text;
                    }

                    if (this.customLabels.suffix && (this.maxPositionIndex != this.arrStepValues.length - 1)) {
                        text = text + ' ' + this.customLabels.suffix;
                    }
                }

                if (this.lastResultText != text) {
                    this.sliderResult.text(text);
                }
                this.lastResultText = text;

                return {
                    index: index,
                    hasCollision: hasCollision
                };
            },

            getStepIndex: function (slider) {
                this.loadResponsiveVariables();
                this.oneStepWidth = this.oneStepWidth == 0 ? 1 : this.oneStepWidth;
                return  parseFloat(slider.css('left')) / this.oneStepWidth;
            },

            changeSliderPositionComplete: function (slider, stepIndex, ignoreComplete) {
                if (slider) {
                    this.setTranslateX(slider, 0);

                    this.isComplete = this.noRepeatPosition !== stepIndex;

                    this.noRepeatPosition = stepIndex;

                    this.isFirstSlider = $(slider).hasClass('slider-1');
                    stepIndex = this.setSliderResult(slider, stepIndex).index;

                    this.setRangePosition();


                    if (this.isComplete && !ignoreComplete) {
                        if ($.isFunction(settings.complete)) {
                            settings.complete.call(this, this.hasSecondSlider ? [this.minPositionIndex, this.maxPositionIndex]
                                : [this.minPositionIndex]);
                        }
                    }

//                    this.lastPos.left[slider.hasClass("slider-1") ? 0 : 1] = stepIndex * this.oneStepWidth;
                    this.lastPos.index[this.isFirstSlider ? 0 : 1] = stepIndex;

                    this.setCSSLeft(slider, (stepIndex * this.oneStepWidthPercent) + "%");

                    this.setStepActive(slider, stepIndex, true);
                }
            },

            setRangePosition: function () {

                this.loadResponsiveVariables();

                this.leftRange = 0;
                this.rightRange = 0;

                if (this.hasSecondSlider) {
                    this.leftRange = this.minPositionIndex * this.oneStepWidthPercent;
                    this.rightRange = (this.max / this.step - this.maxPositionIndex) * this.oneStepWidthPercent;
                } else {
                    this.rightRange = (this.max / this.step - this.minPositionIndex) * this.oneStepWidthPercent - (this.minPositionIndex == 0 ? 1 : 0);
                }
                this.sliderRange.css({
                    left: this.leftRange + "%",
                    right: this.rightRange + "%"
                });
            },
            setStepActiveForInit: function (slider, stepIndex) {
                this.setStepActive(slider, stepIndex, true);
            },

            setStepActive: function (slider, stepIndex, isInit) {
                if (isInit || (stepIndex !== this.stepOldIndex1 && stepIndex !== this.stepOldIndex2))
                    this.stepList.children('li').eq(stepIndex).addClass('active');

                var isSlider1 = isInit ? slider.hasClass('slider-1') : this.isFirstSlider;

                if (isSlider1) {
                    if (stepIndex !== this.stepOldIndex1) {
                        this.stepList.children('li')
                            .eq(this.stepOldIndex1)
                            .removeClass('active');
                    }
                    this.stepOldIndex1 = stepIndex;
                } else {
                    if (stepIndex !== this.stepOldIndex2) {
                        this.stepList.children('li')
                            .eq(this.stepOldIndex2)
                            .removeClass('active');
                    }
                    this.stepOldIndex2 = stepIndex;
                }
            },


            setSliderFocus: function (slider) {
                if (this.sliderFocusedItem != slider)
                    slider
                        .siblings()
                        .removeClass(settings.sliderFocusedClass)
                        .end()
                        .addClass(settings.sliderFocusedClass);

                this.sliderFocusedItem = slider;
                if (this.hasSecondSlider) {
                    this.isFirstSlider = slider.hasClass('slider-1');
                }
            },

            setMinPosition: function (pos, ignoreComplete) {
                this.changeSliderPositionComplete(this.slider1, pos, ignoreComplete);
            },

            setMaxPosition: function (pos, ignoreComplete) {
                this.changeSliderPositionComplete(this.slider2, pos, ignoreComplete);
            },

            setAltLabels: function () {
                if (this.altStepValues && this.altStepValues.length) {
                    if (this.altStepValues[0]) {
                        this.setStepLabel(0, (this.minPositionIndex == 0) ? this.arrStepValues[0] : this.altStepValues[0]);
                    }
                }
            },

            setStepLabel: function (index, newLabel) {
                if ((index >= 0) && (index < this.countCircles)) {
                    $(this.stepElements[index]).html(newLabel);
                }
            },

            setStep: function (index, newLabel, newValue) {
                this.setStepLabel(index, newLabel);

                if ((index >= 0) && (index < this.arrStepValues.length)) {
                    this.arrStepValues[index] = newValue;

                    if (this.minPositionIndex == index) {
                        this.setSliderResult(this.slider1, index);
                    }
                }
            },


            appendDivElement: function (className) {
                return this.appendDOMElement("div", className);
            },

            appendDOMElement: function (tagName, className) {
                return $("<" + tagName + "/>", {"class": className});
            },

            setCSSLeft: function (elem, left) {
                elem.css({
                    left: left
                });
            },

            setTranslateX: function (elem, x) {
                elem.css({
                    transform: "translateX(" + x + "px)",
                    webkitTransform: "translateX(" + x + "px)"
                });
            },

            documentBody: $('body'),
            sliderWrap: null,
            slider1: null,
            slider2: null,
            sliderBG: null,
            sliderRange: null,
            sliderRoad: null,
            sliderOutput: null,
            sliderResult: null,
            sliderFocusedItem: null,
            stepList: null,
            stepElements: null,
            arrStepValues: settings.arrStepValues,
            altStepValues: settings.altStepValues,
            customLabels: settings.customLabels || {
                initial: null,
                prefix: null,
                suffix: null
            },
            min: settings.min,
            max: settings.max,
            step: settings.step,
            hasSecondSlider: settings.hasSecondSlider,
            minPosition: settings.minPosition,
            maxPosition: settings.maxPosition,
            oneStepWidth: null,
            oneStepWidthPercent: null,
            noRepeatPosition: settings.minPosition,
            isComplete: null,
            countCircles: null,
            divisionPos: null,
            divisionDistance: null,
            sliderWrapOffsetLeft: 0,
            stepOldIndex1: -1,
            stepOldIndex2: -1,
            lastSlider: null,
            lastValue: [],
            width: null,
            stepPos: 0,
            lastPos: {
                left: [0, 0],
                index: [0, 0]
            },
            lastResultText: "",
            lastIndex: -1,
            dragIndex: null,
            dragResult: {
                index: -1,
                hasCollision: false
            },
            minPositionIndex: null,
            maxPositionIndex: null,
            sliderFocusedClass: settings.sliderFocusedClass,
            isFirstSlider: true,
            hasSliderOutput: settings.hasSliderOutput
        };

        return SliderControl.initialize($(this));
    };

    $.fn.touchSlider.defaultOptions = {
        min: 0,//
        max: 10,
        step: 2,
        hasSecondSlider: false,//one / two slider
        hasSliderOutput: false,//theme1(false) / theme2(true)
        minPosition: 0,//first slider position index of arrStepValues(for example: if value is 3 => arrStepValues[3] item has selected(6))
        maxPosition: 0,//second slider
        arrStepValues: [0, 2, 4, 6, 8, 10],//it is titles of each steps
        sliderWrapClass: "slider-wrapper",
        sliderBGClass: "slider-bg",
        sliderRangeClass: "slider-range",
        sliderStepClass: "slider-steps",
        sliderRoadClass: "slider-road",
        sliderItemClass: "slider-item",
        sliderFocusedClass: "slider-item-focused",
        sliderOutputClass: "slider-output-wrap",
        sliderInputClass: "slider-input",
        sliderResultClass: "slider-result",
        load: null,//function
        complete: null//function
    };
});