chrome.tabs.onActivated.addListener(activeInfo => interact(activeInfo));

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.runtime.onMessage.addListener(
        function (request) {
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    chrome.tabs.sendMessage(tab.id, request);
                })
            });
        }
    );

})


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        interact({tabId: tabId})
    }
})
chrome.runtime.onMessage.addListener(
    function (request) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (tab) {
                chrome.tabs.sendMessage(tab.id, request);
            })
        });
    }
);


function interact(info) {


    async function createEventHandler() {
        chrome.runtime.onMessage.addListener(
            function (request) {
                if (request.type === "GapSizeChange") {
                    if (Number.isInteger(request.new_width)) {
                        if (!globals.enabled) {
                            document.addEventListener('mousemove', updateWithMousePosition, false);
                            globals.enabled = true;
                        }
                        chrome.storage.sync.set({gap_width: request.new_width});
                        globals.width = request.new_width
                        drawBarsWithGap(window.innerHeight / 2);
                    }

                }
                if (request.type === "opacityChange") {
                    if (typeof request.new_opacity == 'number' && !isNaN(request.new_opacity)) {
                        if (!globals.enabled) {
                            document.addEventListener('mousemove', updateWithMousePosition, false);
                            globals.enabled = true;
                            drawBarsWithGap(window.innerHeight / 2);

                        }
                        chrome.storage.sync.set({bg_opacity: parseFloat(request.new_opacity)});
                        globals.bg_opacity = parseFloat(request.new_opacity);
                        drawBarsWithGap(window.innerHeight / 2);
                    }
                }
                if (request.type === "actionKeyChange") {

                    chrome.storage.sync.set({action_key: request.new_action_key});
                    globals.action_key = request.new_action_key;
                }
            }
        );

        function drawBarsWithGap(mousey) {
            div_top = document.getElementById("plugin_top_bar");
            div_bottom = document.getElementById("plugin_bottom_bar");
            div_top.style.opacity = globals.bg_opacity;
            div_bottom.style.opacity = globals.bg_opacity;
            div_top.style.height = (mousey - globals.width).toString() + 'px';
            div_bottom.style.height = (window.innerHeight - (mousey + globals.width)).toString() + 'px';
        }

        function updateWithMousePosition(event) {

            div_top = document.getElementById("plugin_top_bar");
            div_bottom = document.getElementById("plugin_bottom_bar");
            y = event.clientY;

            if (y > globals.width + 1 && y < window.innerHeight - globals.width + 1) {
                drawBarsWithGap(y)
            }
        }


        function toggleEnabled(event) {
            if (event.button === 0) {
                if (event[globals.action_key]) {

                    if (globals.enabled) {
                        document.removeEventListener('mousemove', updateWithMousePosition, false);
                        globals.enabled = false;
                        globals.positionListener = null;
                        div_top = document.getElementById("plugin_top_bar");
                        div_bottom = document.getElementById("plugin_bottom_bar");

                        div_top.style.height = '0px';
                        div_bottom.style.height = '0px';
                    } else {
                        document.addEventListener('mousemove', updateWithMousePosition, false);
                        globals.enabled = true;
                        drawBarsWithGap(window.innerHeight / 2);

                    }
                }
            }

        }

        if (!document.getElementById("plugin_top_bar")) {

            globals = {width: 25, enabled: false, bg_opacity: 0.5, action_key: "type"}

            chrome.storage.sync.get(['bg_opacity'], function (result) {
                if (result.bg_opacity !== undefined) {
                    globals.bg_opacity = result.bg_opacity;
                } else {
                    chrome.storage.sync.set({bg_opacity: globals.bg_opacity});

                }
            });

            await chrome.storage.sync.get(['gap_width'], function (result) {
                if (result.gap_width !== undefined) {
                    globals.width = result.gap_width;
                } else {
                    chrome.storage.sync.set({gap_width: globals.width});

                }
            });
            await chrome.storage.sync.get(['action_key'], function (result) {
                if (result.action_key !== undefined) {
                    globals.action_key = result.action_key;
                } else {
                    chrome.storage.sync.set({action_key: globals.action_key});

                }
            });

            let style_top = "position: fixed;top:0px;left:0px; height:0px;width:100%;background-color:rgba(100,100,100);z-index:10000;overflow:hidden;"

            var div_top = document.createElement('div');
            div_top.id = "plugin_top_bar"
            div_top.style = style_top;
            div_top.style.opacity = globals.bg_opacity;
            document.body.appendChild(div_top);

            let style_bottom = "position: fixed;bottom:0px;left:0px; height:0px;width:100%;background-color:rgba(100,100,100);z-index:10000;overflow:hidden;"

            var div_bottom = document.createElement('div');
            div_bottom.id = "plugin_bottom_bar"
            div_bottom.style = style_bottom;
            div_bottom.style.opacity = globals.bg_opacity;

            document.body.appendChild(div_bottom);

            document.addEventListener('mousedown', toggleEnabled, false);


            await chrome.storage.sync.get(['default_on'], function (result) {
                if (result.default_on !== undefined) {
                    if (result.default_on) {
                        document.addEventListener('mousemove', updateWithMousePosition, false);
                        globals.enabled = true;
                        drawBarsWithGap(window.innerHeight / 2);

                    }
                } else {
                    chrome.storage.sync.set({default_on: true});
                    document.addEventListener('mousemove', updateWithMousePosition, false);
                    globals.enabled = true;
                    drawBarsWithGap(window.innerHeight / 2);

                }

            });
        }
    }

    chrome.scripting.executeScript({
        target: {tabId: info.tabId, allFrames: true},
        func: createEventHandler,
    });


}
