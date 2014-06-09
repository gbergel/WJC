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
            <xd:p><xd:b>Created on:</xd:b> Mar 3, 2011</xd:p>
            <xd:p><xd:b>Author:</xd:b> jamesc</xd:p>
            <xd:p>Create XHTML Fragment with All Readings</xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:variable name="witnesses" select="//listWit"/>
    <xsl:variable name="root" select="/"/>
    <xsl:template match="/">
        <html>
            <head><title>Fragmented WJC</title></head>
            <body>
                <div id="WJC-fragments">
                  
                    <xsl:apply-templates select="//head[@xml:id]| //l[@xml:id]"/>
                    </div>
            </body>
        </html>
        </xsl:template>
    
    <xsl:template match="l[@xml:id]|head[@xml:id]">
        <xsl:variable name="ID" select="@xml:id"/>
        <xsl:variable name="class"><xsl:choose><xsl:when test="name()='l'">appline</xsl:when><xsl:when test="name()='head'">apphead</xsl:when></xsl:choose>
        </xsl:variable>
        <ul id="{concat($class, $ID)}" class="{$class}" >
            <xsl:variable name="listOfWits"><xsl:text>  </xsl:text><xsl:for-each select=".//*/@wit"><xsl:text> </xsl:text><xsl:value-of select="."/><xsl:text>  </xsl:text></xsl:for-each> </xsl:variable>
            <xsl:variable name="wits"><xsl:for-each select="tokenize(normalize-space($listOfWits), ' ')"><wit><xsl:value-of select="."/></wit></xsl:for-each></xsl:variable>
            <xsl:for-each select="$witnesses//witness">
                <xsl:variable name="wit-ID" select="@xml:id"/>
                <xsl:choose>
                    <xsl:when test="$wits//html:wit = concat('#',$wit-ID)"><li id="{concat($class, $ID, '_', $wit-ID)}" class="{concat($class, '-fragment')}"><span class="{concat('sigil ', @xml:id)}"><xsl:value-of select="translate(@xml:id, '_', ' ')"/>: </span><xsl:text> </xsl:text><span class="linecontent"><xsl:apply-templates select="$root//*[@xml:id = $ID]/*"><xsl:with-param name="witness" select="@xml:id"/></xsl:apply-templates></span></li></xsl:when>
                    <xsl:otherwise><li class="{concat($class, '-fragment')} noWitness"><span class="{concat('sigil ', @xml:id)}"><xsl:value-of select="translate(@xml:id, '_', ' ')"/>: </span> <span class="linecontent noWitness"> [no witness]</span></li></xsl:otherwise>
                </xsl:choose>
                </xsl:for-each>
            </ul>
    </xsl:template>
    
    <xsl:template match="app"><xsl:param name="witness"/><xsl:apply-templates select="node()|comment()|text()|processing-instruction()"><xsl:with-param name="witness" select="$witness"/></xsl:apply-templates><xsl:text> </xsl:text></xsl:template>
    
    <xsl:template match="rdg[@wit]|lem[@wit]">
        <xsl:param name="witness"/>
        <xsl:variable name="wits"><xsl:for-each select="tokenize(@wit, ' ')"><wit><xsl:value-of select="."/></wit></xsl:for-each></xsl:variable>
        <xsl:if test="$wits/html:wit = concat('#',$witness)"><xsl:apply-templates select="node()|comment()|text()|processing-instruction()"><xsl:with-param name="witness" select="$witness"/></xsl:apply-templates><xsl:text> </xsl:text></xsl:if>
    </xsl:template>
    
    <xsl:template match="milestone[@unit='line'][@n]"><span class="linenumber"><xsl:value-of select="@n"/>:</span> </xsl:template>
    <xsl:template match="note"/> 
    <xsl:template match="choice"><xsl:text> </xsl:text><span class="choice"><xsl:apply-templates/> </span> </xsl:template>
    <xsl:template match="abbr|sic|orig"><span class="{name()}"><xsl:apply-templates/></span> </xsl:template>
    <xsl:template match="corr|expan|reg|ex"/>
    <xsl:template match="lb">[linebreak]</xsl:template>
    
    <xsl:template match="text()"><xsl:value-of select="normalize-space(.)"/></xsl:template>
    
    <xsl:template match="hi[@rend]"><xsl:text> </xsl:text> <span class="{@rend}"><xsl:apply-templates/></span><xsl:text> </xsl:text></xsl:template>
    
</xsl:stylesheet>
