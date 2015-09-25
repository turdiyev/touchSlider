My custom range slider for project

var slider1 = $("#slider1").touchSlider({
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
                            complete: function (indices) {
                                //When slider is moved, update the bound model value with the newly selected one
                                console.log(indices);
                            }
                });