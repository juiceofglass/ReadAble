document.addEventListener("DOMContentLoaded", function (e) {

    document.getElementById("gapSizeSlider").value = 25;
    chrome.storage.sync.get(['gap_width'], function (result) {
        if (result.gap_width != undefined) {
            document.getElementById("gapSizeSlider").value = result.gap_width;
        }
    });
    document.getElementById("gapSizeSlider").addEventListener("input", ChangeValue);

    function ChangeValue(event) {
        chrome.runtime.sendMessage({type: "GapSizeChange", new_width: parseInt(event.target.value)});
    }

    document.getElementById("opacitySlider").value = 50;
    chrome.storage.sync.get(['bg_opacity'], function (result) {
        if (result.bg_opacity != undefined) {
            document.getElementById("opacitySlider").value = result.bg_opacity * 100;
        }
    });
    document.getElementById("opacitySlider").addEventListener("input", ChangeOpacity);

    function ChangeOpacity(event) {
        chrome.runtime.sendMessage({type: "opacityChange", new_opacity: parseFloat(event.target.value) / 100});
    }

    if (!document.getElementById("actionKey").value) {
        document.getElementById("actionKey").value = 'type'
    }
    chrome.storage.sync.get(['action_key'], function (result) {
        if (result.action_key != undefined) {
            document.getElementById("actionKey").value = result.action_key;
        }
    });
    document.getElementById("actionKey").addEventListener("change", ChangeActionKey);

    function ChangeActionKey(event) {
        chrome.runtime.sendMessage({type: "actionKeyChange", new_action_key: event.target.value});
    }

    chrome.storage.sync.get(['default_on'], function (result) {
        if (result.default_on !== undefined) {
            document.getElementById("defaultOn").checked = result.default_on;
        }
    });
    document.getElementById("defaultOn").addEventListener("change", ChangeDefaultOn);

    function ChangeDefaultOn(event) {
        let value=event.target.checked;
        chrome.storage.sync.set({default_on: value});
    }
});