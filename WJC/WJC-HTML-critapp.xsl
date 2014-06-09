<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="xs xd tei"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xpath-default-namespace="http://www.tei-c.org/ns/1.0"
    version="2.0">
    <xsl:strip-space elements="*"/>
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Jun 13, 2011</xd:p>
            <xd:p><xd:b>Author:</xd:b> jamesc</xd:p>
            <xd:p>Stylesheet to generate HTML file of each app</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <html>
            <head><title>WJC CritApp Fragments</title></head>
            <body>
                <div id="WJC-critapp">
                    <xsl:apply-templates select="//app"/>
                </div>
            </body>
        </html>
    </xsl:template>
    
    <xsl:template match="app">
        <ul class="app" id="{concat('app-', count(preceding::app)+1)}">
            <xsl:apply-templates select="rdg"/>
        </ul>
    </xsl:template>
   
   
    <xsl:template match="rdg">
        <xsl:if test="not(translate(normalize-space(.), ' ', '')='')"><li class="rdg"><span class="witnesses">
<xsl:for-each select="tokenize(normalize-space(@wit), ' ')">
<span class="{concat('sigil ', translate(., '#', ''))}"><xsl:value-of select="translate(translate(.,'_', ' '), '#', '')"/>; </span><xsl:text>  </xsl:text>
</xsl:for-each><xsl:text>:  </xsl:text> 
</span>
            <span class="reading"><xsl:apply-templates /></span></li>
            </xsl:if>
    </xsl:template>
   
   <xsl:template match="note"/>
    <xsl:template match="choice"><xsl:text> </xsl:text><span class="choice"><xsl:apply-templates/> </span> </xsl:template>
    <xsl:template match="abbr|sic|orig"><span class="{name()}"><xsl:apply-templates/></span> </xsl:template>
    <xsl:template match="corr|expan|reg|ex"/>
    <xsl:template match="hi[@rend]"><xsl:text> </xsl:text> <span class="{@rend}"><xsl:apply-templates/></span><xsl:text> </xsl:text></xsl:template>
    
   
</xsl:stylesheet>
