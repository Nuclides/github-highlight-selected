$(function () {
    function restore() {
        $(".ghs-highlight").removeClass("ghs-highlight");
        $(".ghs-partial-highlight").contents().unwrap();
    }

    $("body").mouseup(function (e) {
        restore();

        var selection = $.trim(window.getSelection());
        if (selection) {
            var codeArea = $(".js-file-line-container");
            codeArea.find(".js-file-line").contents().filter(function () {
                return this.nodeType == Node.TEXT_NODE;
            }).each(function () {
                if (this != e.target && $(this).text().indexOf(selection) > -1) {
                    $(this).replaceWith('<span>' + $(this).text() + '</span>');
                }
            });
            codeArea.find("span:not(:has(*))").each(function () {
                if (this != e.target) {
                    if ($(this).text() == selection) {
                        $(this).addClass("ghs-highlight");
                    }
                    else if ($(this).text().indexOf(selection) > -1) {
                        $(this).html(function(_, html) {
                            var re = new RegExp(selection, "g");
                            return html.replace(re, '<span class="ghs-partial-highlight">' + selection + '</span>');
                        });
                    }
                }
            });
        }
    });
});
