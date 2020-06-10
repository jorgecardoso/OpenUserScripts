// ==UserScript==
// @name         Assignments UC Paste Comments
// @namespace    https://jorgecardoso.eu
// @version      0.1
// @description  Allows pasting Comments directly on the Assignments page of the InforDocente system of the University of Coimbra. Just copy (Ctrl-C) a table from a spreadsheet file making sure that there is a column with the student number and a column with the comments (the comments column should be the last column). Then open the assignment page and press Ctrl-V; a button will appear: click on it and wait for all comments to be inserted.
// @author       jorgecardoso
// @match        https://infordocente.uc.pt/nonio/ensino/detalhesSubmissaoTrabalhos.do*
// @match        https://infordocente.uc.pt/nonio/ensino/detalhesSubmissaoAluno.do*
// @match        https://infordocente.uc.pt/nonio/ensino/adicionarAlterarApreciacao.do*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if ( window.location.href.indexOf("detalhesSubmissaoTrabalhos.do") >= 0) {
        console.log("Entregas Trabalhos UC");

        document.querySelector("body").addEventListener("paste", function(evt){
            var data = evt.clipboardData.getData("text/plain");
            console.log("Pasted data: ");

            var newData = "";
            var insideQuote = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i] === "\"" ) {
                    insideQuote = !insideQuote;
                    console.log("quote");
                }
                if (data[i] === "\n" && insideQuote) {
                    newData += "####";
                } else {
                    newData += data[i];
                }
            }
            //console.log(data);
            console.log(newData);
            var rawTable = newData.split("\n");
            var dataTable = [];
            rawTable.forEach(function(row) {
                var r = row.split("\t").map(function(s) {return s.trim();});
                dataTable.push(r);
            });
            console.log(dataTable);
            localStorage.setItem("dataTable", JSON.stringify(dataTable));
            var automateButton = document.createElement('button');
            automateButton.innerText = "Go";
            automateButton.style.cssText = "position: fixed; right:0; top:50%";
            document.body.appendChild(automateButton);

            automateButton.addEventListener("click", function() {
                console.log("Automating");
                var linksToProcess = [];

                // get all links for student numbers present in our data table
                var rows = document.querySelectorAll("table td:nth-last-child(6),table td:nth-last-child(7)");

                rows.forEach(function(row){
                    console.log(row);
                    if (existsInTable(dataTable, row.innerText.trim())) {
                        console.log("exists");
                        linksToProcess.push(row.parentElement.querySelector("[href^=\"detalhesSubmissaoAluno.do\"]"));
                    }

                });
                console.log(linksToProcess);


                //  var allLinks = document.querySelectorAll("[href^=\"detalhesSubmissaoAluno.do\"]");
                var currentLink = 0;

                window.addEventListener("message", function(event) {
                    console.log("received", event);
                    setTimeout(function() {
                        processNextStudent();
                    }, 1000);
                }, false);


                //console.log(allLinks);
                var processNextStudent = function() {
                    currentLink++;
                    console.log("Current Link", currentLink);
                    if (currentLink < linksToProcess.length) {
                        win.location= linksToProcess[currentLink].href+"&automate=true";
                        console.log("Opened URL", linksToProcess[currentLink].href+"&automate=true");
                        //setTimeout( returnCloseWindow(window), 5000);
                    }
                };


                var win = window.open(linksToProcess[currentLink].href+"&automate=true");

            });
        });

    } else if ( window.location.href.indexOf("detalhesSubmissaoAluno.do") >= 0 && window.location.href.indexOf("automate=true") >= 0) {
        console.log("Entregas Trabalhos UC Aluno");

        var adicionar = document.querySelector("[href^=\"adicionarAlterarApreciacao.do\"]");
        if (adicionar !== null) {
            window.location = adicionar.href+"&automate=true";
        }

    } else if ( window.location.href.indexOf("adicionarAlterarApreciacao.do") >= 0 && window.location.href.indexOf("automate=true") >= 0 ) {
        window.onload = function() {
            console.log("Entregas Trabalhos UC Aluno: Apreciacao");
            var dataTable = JSON.parse(localStorage.getItem("dataTable"));
            console.log(dataTable);
            if (dataTable) {
                var editor = document.querySelector("#htmlhelper_ifr");
                console.log(editor);

                // setTimeout(function() {
                var autores = document.querySelector("#adicionarAlterarApreciacaoFormBean table tr:nth-child(3) td:nth-child(2)");
                var studentNumbers =  Array.from(new Set(autores.innerText.match(/\d\d\d\d\d\d\d\d\d\d/gi)));
                console.log(studentNumbers);
                var first = true;
                var innerDoc = editor.contentDocument || editor.contentWindow.document;
                var textField = innerDoc.getElementById("tinymce");
                for (var i = 0; i < studentNumbers.length; i++ ) {
                    console.log(studentNumbers[i]);
                    for ( var j = 0; j < dataTable.length; j++) {
                        for ( var k = 0; k < dataTable[j].length; k++) {
                            //console.log(dataTable[j][k]);
                            if (studentNumbers[i] === dataTable[j][k] ) {
                                if (first) {
                                    textField.innerText = "";
                                    first = false;
                                }
                                console.log(dataTable[j][dataTable[j].length-1]);

                                textField.innerText += dataTable[j][dataTable[j].length-1].replace(/####/g, '\n').replace(/"/g, '');

                            }
                        }
                    }
                }
                if (!first) {
                    var visible = document.querySelector("input[name=\"visivelAlunos\"]");
                    visible.checked = true;
                    var gravar = document.querySelector("input[type=\"submit\"][value=\"Gravar\"]");
                    window.opener.postMessage("ok", "*");
                    gravar.click();
                }
                //  }, 3000);
            }



        };

    }

    function existsInTable(dataTable, value) {
        for ( var j = 0; j < dataTable.length; j++) {
            for ( var k = 0; k < dataTable[j].length; k++) {
                //console.log(dataTable[j][k]);
                if (value === dataTable[j][k] ) {
                    return true;
                }
            }
        }
        return false;
    }
})();