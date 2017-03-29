NJS.Tooltip = function() {
    var div;
    var className = "njs-tooltip";
    var getTooltipDiv = function() {
        if (div) {
            return div;
        }
        div = document.createElement("div");
        if (className) {
            div.className = className;
        }
        div.style.visibility = "hidden";
        div.style.display = "none";
        div.style.position = "absolute";
        div.style.zIndex = 10000000;
        document.body.appendChild(div);
        return div;
    };
    var showTooltip = function(node, text) {
        var div = getTooltipDiv();
        NJS.innerText(div, text);
        div.style.left = "-1000px";
        div.style.display = "inline";
        div.style.visibility = "visible";
        var boxAttributes = NJS.Layout.boxAttributes(node);
        var c = NJS.Layout.confineToViewPort({
            y: boxAttributes.top + boxAttributes.height,
            x: boxAttributes.left + boxAttributes.width
        },
        {
            width: div.clientWidth + 15,
            height: div.clientHeight + 15
        });
        div.style.top = c.y + "px";
        div.style.left = c.x + "px";
    };
    var hideTooltip = function() {
        if (!div) {
            return;
        }
        div.style.visibility = "hidden";
        div.style.display = "none";
    }
    return ({
        configure: function(config) {
            if (!config) {
                return;
            }
            className = config.cls;
            if (div) {
                div.className = className;
            }
        },
        bind: function(node, text) {
            node.addEventListener("mouseover",
            function() {
                showTooltip(node, text);
            },
            false);
            node.addEventListener("mouseout",
            function() {
                hideTooltip();
            },
            false);
        }
    });
} ();
