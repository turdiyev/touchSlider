<h3>My custom range slider for cross-platform browsers.</h1>

<p>This slider has tested Chrome, FireFox, IE, Android, iOS, Windows Phone 7,8. It has optimized many time for mobile application(mainly, cordova app)</p>

<hr>  

<pre><code>
var slider1 = $("#slider1").touchSlider({
                    min: 0,//
                    max: 10,
                    step: 2,
                    hasSecondSlider: false,//one / two slider
                    hasSliderOutput: false,//theme1(false) / theme2(true)
                    minPosition: 0,//first slider position index of arrStepValues(for example: if value is 3 => arrStepValues[3] item has selected(6))
                    maxPosition: 0,//second slider
                    arrStepValues: [0, 2, 4, 6, 8, 10],//it is titles of each steps
                    load: null,//function
                    complete: function (indices) {
                        //When slider is moved, update the bound model value with the newly selected one
                        console.log(indices);
                      }
            });
</code></pre>
