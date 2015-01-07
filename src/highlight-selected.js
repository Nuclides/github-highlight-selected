$(function() {
    var codeArea = $(".js-file-line-container");
    var fileLineContainer='.js-file-line-container';
    var lastPage = location.href;
    //     function wrapTextNodes(el){
    //         console.log('wrapping',el)
    //         el.find(".js-file-line").contents().filter(function () {
    //             return this.nodeType == Node.TEXT_NODE;
    //         }).each(function () {
    //             $(this).replaceWith('<span>' + $(this).text() + '</span>');
    //         });}


    function wrapTextNodes(query) {
        // Why did all the gawd dam text selection stuff fail, urgggggghh....atleast this worked!
        function getTextNodesIn(elem, opt_fnFilter) {
            var textNodes = [];
            if (elem) {
                for (var nodes = elem.childNodes, i = nodes.length; i--;) {
                    var node = nodes[i],
                        nodeType = node.nodeType;
                    if (nodeType == 3) {
                        if (!opt_fnFilter || opt_fnFilter(node, elem)) {
                            textNodes.push(node);
                        }
                    } else if (nodeType == 1 || nodeType == 9 || nodeType == 11) {
                        textNodes = textNodes.concat(getTextNodesIn(node, opt_fnFilter));
                    }
                }
            }
            return textNodes;
        }
        var el = document.querySelector(query);
        if (!el) return;
        var results = getTextNodesIn(el);
        results.forEach(function(node) {
            var span = document.createElement('span');
            span.textContent = node.nodeValue;
            if (node.parentNode) node.parentNode.replaceChild(span, node);
        })
    }

    wrapTextNodes(fileLineContainer);

    // watch for page updating...
    var whatToObserve = {
        childList: true,
        attributes: false,
        subtree: true,
        attributeOldValue: false /*, attributeFilter: []*/
    };
    var mutationObserver = new MutationObserver(function(mutationRecords) {
        if (location.href != lastPage) {
            lastPage = location.href;
            wrapTextNodes(fileLineContainer);
        }
    });
    mutationObserver.observe(document.querySelector('.file-navigation .breadcrumb'), whatToObserve);

    function restore() {
        $(".ghs-highlight").removeClass("ghs-highlight");
        $(".ghs-partial-highlight").contents().unwrap();
    }

    function replaceAll(str, target, replacement) {
        return str.split(target).join(replacement);
    }

    $("body").mouseup(function(e) {
        restore();
        var codeArea = $(fileLineContainer); // think the page updating killed this, this fixs that
        var selection = $.trim(window.getSelection());

        if (selection) {
            codeArea.find("span:not(:has(*))").each(function() {
                if (this != e.target) {
                    if ($(this).text() == selection) {
                        $(this).addClass("ghs-highlight");
                    }
                    else if ($(this).text().indexOf(selection) > -1) {
                        $(this).html(function(_, html) {
                            return replaceAll(html, selection, '<span class="ghs-partial-highlight">' + selection + '</span>');
                        });
                    }
                }
            });
        }
    });
});