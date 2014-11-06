$(function () {
    var codeArea = $(".js-file-line-container");
    codeArea.find(".js-file-line").contents().filter(function () {
        return this.nodeType == Node.TEXT_NODE;
    }).each(function () {
        $(this).replaceWith('<span>' + $(this).text() + '</span>');
    });

    function restore() {
        $(".ghs-highlight").removeClass("ghs-highlight");
        $(".ghs-partial-highlight").contents().unwrap();
    }

    function replaceAll(str, target, replacement) {
        return str.split(target).join(replacement);
    }

    $("body").mouseup(function (e) {
        restore();

        var selection = $.trim(window.getSelection());

        if (selection) {
            codeArea.find("span:not(:has(*))").each(function () {
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
