$(function () {
    function restore() {
        $(".ghs-highlight").removeClass("ghs-highlight");
        $(".ghs-partial-highlight").contents().unwrap();
    }

    $("body").mouseup(function (e) {
        restore();

        var selection = $.trim(window.getSelection());
        if (selection) {
            var codeArea = $(".file-box");
            codeArea.find("span:not(:has(*))").each(function () {
                if (this != e.target) {
                    if ($(this).text() == selection) {
                        $(this).addClass("ghs-highlight");
                    }
                    else if ($(this).text().indexOf(selection) > -1) {
                        $(this).html(function(_, html) {
                           return html.replace(selection, '<span class="ghs-partial-highlight">' + selection + '</span>');
                        });
                    }
                }
            });
        }
    });
});
