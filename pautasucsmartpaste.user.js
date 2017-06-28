// ==UserScript==
// @name         Pautas UC Smart Paste
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Allows pasting "Pautas" directly on the Pautas page of the InforDocente system of the University of Coimbra. Just copy (Ctrl-C) a table from a spreadsheet file making sure that there is a column with the student number and a column with the grade. Then click on any input in the pauta webpage and Ctrl-V.
// @author       jorgecardoso
// @match        https://infordocente.uc.pt/nonio/pautas/gerePauta.do*
// @grant        none
// @updateURL https://openuserjs.org/meta/jorgecardoso/Pautas_UC_Smart_Paste.meta.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("Pautas UC Smart Paste");

    document.querySelector("table.displaytable input").addEventListener("paste", function(evt){

        var data = evt.clipboardData.getData("text/plain");

        console.log("Pasted data: ");
        console.log(data);

        var rawTable = data.split("\n");
        var dataTable = [];
        rawTable.forEach(function(row) {
            var r = row.split("\t").map(function(s) {return s.trim();});
            dataTable.push(r);
        });
        console.log(dataTable);


        function getStudentScore(studentNumber) {
            for (var i = 0; i < dataTable.length; i++) {
                var row = dataTable[i];
                for (var j = 0; j < row.length; j++) {
                    var d = row[j];
                    if(d.trim() === studentNumber.trim() ) {
                        console.log("Found student", studentNumber, " grade: ", row[row.length-1]);
                        return row[row.length-1];
                    }
                }
            }
            return undefined;
        }

        document.querySelectorAll("table.displaytable tr").forEach(function(tableRow) {
            console.log(tableRow);
            var studentNumber = tableRow.querySelector("td:nth-child(2)");
            //console.log($studentNumber.text());

            if ( studentNumber ) {
                var score =  tableRow.querySelector("input");
                console.log(score);
                var studentScore = getStudentScore(studentNumber.innerText);
                console.log(studentScore);
                if (studentScore) {
                    score.value = studentScore;
                }

                score.dispatchEvent(new Event("change"));

            }
        });
        evt.preventDefault();
    });

})();