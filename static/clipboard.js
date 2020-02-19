function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
    } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
    };

    document.body.removeChild(textArea);
};
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
    } else {
        navigator
        .clipboard
        .writeText(text)
        .then(() => console.log("Async: Copying to clipboard was successful!"))
        .catch(() => console.error("Async: Could not copy text: ", err));
    };
};
