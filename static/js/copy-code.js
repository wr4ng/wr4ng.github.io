document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre").forEach((codeBlock) => {
    // Create the copy button
    const copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy";
    copyButton.className = "copy-button";
    copyButton.title = "Copy to clipboard";

    // Add the button to the code block
    codeBlock.style.position = "relative";
    copyButton.style.position = "absolute";
    copyButton.style.top = "0.5em";
    copyButton.style.right = "0.5em";

    codeBlock.appendChild(copyButton);

    // Add the copy functionality
    copyButton.addEventListener("click", () => {
      const codeText = codeBlock.querySelector("code").innerText;
      navigator.clipboard.writeText(codeText).then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.innerHTML = "Copy" ;
        }, 2000);
      });
    });
  });
});
