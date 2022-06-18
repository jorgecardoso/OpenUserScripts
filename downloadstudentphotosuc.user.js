// ==UserScript==
// @name         Download student photos from InforDocente
// @namespace    https://jorgecardoso.eu
// @version      0.1
// @description  try to take over the world!
// @author       jorgecardoso
// @match        https://infordocente.uc.pt/nonio/alunos/listaAlunosTurma.do*
// @grant        none
// @license 	 MIT
// ==/UserScript==

(function() {
    'use strict';


    let zoneLinks = document.querySelector(".zonelinks");
    let a = document.createElement("a");
    a.classList.add("botaodetalhes");
    a.innerText = "Download photos";
    zoneLinks.appendChild(a);

    a.addEventListener("click", downloadAllPhotos);

    function downloadAllPhotos() {
        // Your code here...
        let table = document.querySelectorAll("#div_1Alunos table tbody tr[class]");
        console.log(table);
        var temporaryDownloadLink = document.createElement("a");
        document.body.appendChild( temporaryDownloadLink );

        let i = 0;
        let interval = setInterval(download, 500);

        function download() {
            let row = table[i++];
            if (row == null || row == undefined) {
                clearInterval(interval);
            }
            let studentId = row.querySelector("td:nth-child(3)").innerText;
            let photo = row.querySelector("td:nth-child(5) img");
            let xhr = new XMLHttpRequest()
            console.log(studentId);
            xhr.open('GET', photo.src, true);
            xhr.responseType = 'blob';
            xhr.onload = function () {
                let file = new Blob([xhr.response], { type : 'application/octet-stream' });
                temporaryDownloadLink.href = window.URL.createObjectURL(file);
                temporaryDownloadLink.download = studentId+".jpg";

                temporaryDownloadLink.click();
            };
            xhr.send();


        };

    }




})();