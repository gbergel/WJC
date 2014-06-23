
The files in this folder are:

WJC-app.html (generated from WJC.xml with WJC-HTML-apparatus.xsl)
WJC-critapp.html (generated from WJC.xml with WJC-HTML-critapp.xsl)
WJC-HTML-apparatus.xsl (generate line by line apparatus)
WJC-HTML-critapp.xsl (generate reading apparatus)
WJC.xml (source file)
WJC.xsl (use to generate WJC.HTML which is moved to the ../HTML folder)


To regenerate, using recent saxon (v9he) do something like:

saxon -o:WJC-app.html -s:WJC.xml -xsl:WJC-HTML-apparatus.xsl
saxon -o:WJC-critapp.html -s:WJC.xml -xsl:WJC-HTML-critapp.xsl
saxon -o:WJC.html -s:WJC.xml -xsl:WJC.xsl
mv WJC.html ../HTML/
cd ..
git commit -a -m "commit message here"
git push



