<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xd tei"
    xmlns:tei="http://www.tei-c.org/ns/1.0" version="1.0">
    <!-- Import of vmachine.xsl -->
    <xsl:import href="../src/vmachine.xsl"/>
    <!-- Output as it was in vmachine.xsl  -->
    <xsl:output method="html" version="4.01" encoding="utf-8" indent="yes"
        doctype-system="http://www.w3.org/TR/html4/strict.dtd"
        doctype-public="-//W3C//DTD HTML 4.01//EN"/>

    <!-- oxygen documentation -->
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Jan 31, 2011</xd:p>
            <xd:p><xd:b>Author:</xd:b> jamesc</xd:p>
            <xd:p> A Wrapper stylesheet for improvements to the v-machine</xd:p>
        </xd:desc>
    </xd:doc>
    <!-- Existing variable overriding of vmachine.xsl -->
    <xsl:variable name="indexPage">../index.html</xsl:variable>
    <xsl:variable name="vmLogo">../vm-images/poweredby.gif</xsl:variable>
    <xsl:variable name="cssInclude">../src/vmachine.css</xsl:variable>
    <xsl:variable name="jsInclude">../src/vmachine.js</xsl:variable>
    <xsl:variable name="initialVersions">3</xsl:variable>
    <!-- To change the VM so that the bibliographic information page does not
        appear at the initial load, change "true" to "false" below -->
    <xsl:variable name="displayBibInfo">false</xsl:variable>
    <!-- To change the VM so that line numbers are hidden by default, change
        "true" to "false" below -->
    <xsl:variable name="displayLineNumbers">true</xsl:variable>
    <!-- To change the VM's default method of displaying notes, modify the
        following variable: - popup: Popup footnote icons;  - inline: Inline note viewer panel; - none: Hide notes -->
    <xsl:variable name="notesFormat">popup</xsl:variable>
    <xsl:variable name="fullTitle">
        <xsl:choose>
            <xsl:when test="//tei:titleStmt/tei:title != ''">
                <xsl:value-of select="//tei:titleStmt/tei:title"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>No title specified</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="truncatedTitle">
        <xsl:call-template name="truncateText">
            <xsl:with-param name="string" select="$fullTitle"/>
            <xsl:with-param name="length" select="40"/>
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="witnesses" select="//tei:witness[@xml:id]"/>
    <xsl:param name="numWit" select="count($witnesses)"/>
    <xsl:variable name="numWitnesses" select="$numWit"/>


    <!-- InfoDev Changes  -->
    <xsl:variable name="singleWitOnClick">true</xsl:variable>
    <xsl:variable name="editionInfo">false</xsl:variable>

    <xsl:variable name="jQueryHeaderStuff">
        <link rel="stylesheet" type="text/css" href="../src/jquery/jcarousel/skins/basic/skin.css">
            <xsl:comment> </xsl:comment>
        </link>
        <link rel="stylesheet" type="text/css" href="../src/navigation.css" media="all">
            <xsl:comment> </xsl:comment>
        </link>
        <link rel="stylesheet" type="text/css" href="../src/wjc.css" media="all">
            <xsl:comment> </xsl:comment>
        </link>
        <script src="../src/jquery/jcarousel/lib/jquery-1.4.2.min.js" type="text/javascript"><!--  --></script>
        <script src="../src/jquery/jcarousel/lib/jquery.jcarousel.min.js" type="text/javascript"><!--  --></script>
        <script src="../src/jquery/jquery.wunderkind.min.js" type="text/javascript"><!--  --></script>
        <script src="../src/navigation.js" type="text/javascript"><!--  --></script>
        <script src="../src/apparatus.js" type="text/javascript"><!--  --></script>
    </xsl:variable>

    <xsl:variable name="mainNavigation">
        <div id="main-navigation">
            <ul id="main-menu">
                <li>
                    <a href="../index.html">About</a>
                </li>
                <li class="active">
                    <a href="#" onClick="javascript:multipleWitnesses();" class="compare-mode">The
                        Text</a>
                </li>
                <li>
                    <a href="illustrations.html" class="image-mode">Illustrations</a>
                </li>
            </ul>
        </div>
        <!--"/#main-navigation"-->
    </xsl:variable>

    <xsl:variable name="navigationStuff">


        <div id="navigation">

            <div id="mode-navigation">

                <!-- Mode Menu -->
                <ul id="mode-menu">
                    <li class="active">
                        <a href="#" onClick="javascript:singleWitness();" class="browse-mode"
                            >Single</a>
                    </li>
                    <li>
                        <a href="#" onClick="javascript:multipleWitnesses();" class="compare-mode"
                            >Multiple</a>
                    </li>
                </ul>
            </div>
            <!--"/#mode-navigation"-->

            <div id="mode-sub-navigation">

                <ul id="browse-mode-menu" class="browse-mode">
                    <li class="active">
                        <a href="#" class="list-browse-mode">List</a>
                    </li>
                    <li>
                        <a href="#" class="thumb-browse-mode">Thumb</a>
                    </li>
                    <!--    <li><a href="#" class="tree-browse-mode">Tree</a></li>-->
                </ul>

                <!-- Compare Mode Menu -->
                <ul id="compare-mode-menu" class="compare-mode">
                    <li class="active">
                        <a href="#" class="list-compare-mode">List</a>
                    </li>
                    <li>
                        <a href="#" class="thumb-compare-mode">Thumb</a>
                    </li>
                    <!-- <li><a href="#" class="tree-compare-mode">Tree</a></li>-->
                </ul>

            </div>
            <!--"/#mode-sub-navigation"-->

            <div id="witness-navigation">

                <!-- Witness Navigation Menu -->
                <a href="#" onClick="javascript:allWitnesses();" class="all-witnesses">Show all
                    witnesses</a>
                <ul id="witness-navigation-menu">

                    <li>
                        <a href="#" onClick="javascript:selectWitness('A.2.a');"
                            class="w-72px h-30px l-85px t-67px"><img
                                src="../images/thumbs/A.2.a.png" alt="A.2.a Bodleian Wood 401(121)"
                            />A.2.a Bodleian Wood 401(121)</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('C.1.a');"
                            class="w-72px h-30px l-167px t-67px"><img
                                src="../images/thumbs/C.1.a.png" alt="C.1.a Bodleian Douce 2(240a)"
                            />C.1.a Bodleian Douce 2(240a)</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('C.2.a');"
                            class="w-72px h-30px l-249px t-67px"><img
                                src="../images/thumbs/C.2.a.png"
                                alt="C.2.a British Library Roxburghe Rox. III. 47"/>C.2.a British
                            Library Roxburghe Rox. III. 47</a>
                    </li>


                    <li>
                        <a href="#" onClick="javascript:selectWitness('C.3.a');"
                            class="w-72px h-30px l-331px t-67px"><img
                                src="../images/thumbs/C.3.a.png"
                                alt="C.3.a Pepys Library Ballads I: 482-3"/>C.3.a Pepys Library
                            Ballads I: 482-3</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('F.1.a');"
                            class="w-72px h-30px l-413px t-67px"><img
                                src="../images/thumbs/F.1.a.png"
                                alt="F.1.a Harry Ransom L.C. PR3291 A1 W364 1702 HZF"/>F.1.a Harry
                            Ransom L.C. PR3291 A1 W364 1702 HZF</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('G.1.1.a');"
                            class="w-72px h-30px l-504px t-50px"><img
                                src="../images/thumbs/G.1.1.a.png"
                                alt="G 1.1.a Cambridge Madden Garlands vol. III"/>G.1.1.a Cambridge
                            Madden Garlands vol. III</a>
                    </li>


                    <li>
                        <a href="#" onClick="javascript:selectWitness('G.1.2.a');"
                            class="w-72px h-30px l-504px t-85px"><img
                                src="../images/thumbs/G.1.2.a.png" alt="G.1.2.a Brown B1753 EN"
                            />G.1.2.a Brown B1753 EN</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('H.1.a');"
                            class="w-72px h-30px l-606px t-91px"><img
                                src="../images/thumbs/H.1.a.png"
                                alt="H.1.a Bodleian Vet. A4 a.13, fol.41"/>H.1.a Bodleian Vet. A4
                            a.13, fol.41</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('H.2.a');"
                            class="w-72px h-30px l-597px t-44px"><img
                                src="../images/thumbs/H.2.a.png"
                                alt="H.2.a Cambridge Madden Garlands vol. III"/>H.2.a Cambridge
                            Madden Garlands vol. III</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('H.3.f');"
                            class="w-72px h-30px l-703px t-69px"><img
                                src="../images/thumbs/H.3.f.png" alt="H.3.f Bergel"/>H.3.f
                            Bergel</a>
                    </li>


                    <li>
                        <a href="#" onClick="javascript:selectWitness('H.4.a');"
                            class="w-72px h-30px l-703px t-35px"><img
                                src="../images/thumbs/H.4.a.png"
                                alt="H.4.a British Library RB.23.a.2518"/>H.4.a British Library
                            RB.23.a.2518</a>
                    </li>



                    <li>
                        <a href="#" onClick="javascript:selectWitness('H.5.a');"
                            class="w-72px h-30px l-703px t-0px"><img
                                src="../images/thumbs/H.5.a.png"
                                alt="H.5.a British Library Roxburghe Rox.III.733"/>H.5.a British
                            Library Roxburghe Rox.III.733</a>
                    </li>


                    <li>
                        <a href="#" onClick="javascript:selectWitness('I.1.a');"
                            class="w-72px h-30px l-800px t-90px"><img
                                src="../images/thumbs/I.1.a.png"
                                alt="I.1.a  Bodleian Harding B 5(78)"/>I.1.a Bodleian Harding B
                            5(78)</a>
                    </li>

                    <li>
                        <a href="#" onClick="javascript:selectWitness('I.2.b.a');"
                            class="w-72px h-30px l-798px t-0px"><img
                                src="../images/thumbs/I.2.b.a.png"
                                alt="I.2.b.a Indiana Lily Chapbooks 1349"/>I.2.b.a Indiana Lily
                            Chapbooks 1349</a>
                    </li>


                    <li>
                        <a href="#" onClick="javascript:selectWitness('J.1.2.a');"
                            class="w-72px h-30px l-889px t-31px"><img
                                src="../images/thumbs/J.1.2.a.png"
                                alt="J.1.2.a Massachussets Historical Society Bdses 1821"/>J.1.2.a
                            Massachussets Historical Society Bdses 1821</a>
                    </li>


                    <!--<li><a href="#" onClick="javascript:selectWitness('PIL');" class="w-72px h-30px l-889px t-31px"><img src="../images/thumbs/PIL.png" alt="PIL: Massachussets Historical Society Broadsides 1821; British Library: 1875.d.7.(22.); NSTC: 2A5327."/>PIL: Massachussets Historical Society Broadsides 1821; British
                     Library: 1875.d.7.(22.); NSTC: 2A5327.</a></li>
                 -->



                </ul>
                <!-- <img src="../images/tree-nav.png" id="witness-navigation-tree" width="960" height="120" />-->

            </div>
            <!--"/#witness-navigation"-->

        </div>
        <!--"/#navigation"-->

        <!-- Commentary Pane DIV -->
        <div id="critical-commentary"> </div>
        <!--"/#critical-commentary"-->


    </xsl:variable>



    <!-- added line numbers as an app/rdg instead  -->

    <!-- Line numbers -->
    <!--   <xsl:template name="addLineNumber">
        <xsl:param name="increment"/>
        <xsl:variable name="witnessID" ><xsl:value-of select="$witnesses[$increment]/@xml:id"/></xsl:variable>
        <xsl:if test="tei:app/tei:rdg[contains(@wit, concat('#', $witnessID))][translate(normalize-space(.), ' ', '') != '']"><span>
            <xsl:choose>
                <xsl:when test="@n">
                    <xsl:attribute name="class">
                        <xsl:text>linenumber</xsl:text>
                    </xsl:attribute>
                    <xsl:if test="$displayLineNumbers = 'false'">
                        <xsl:attribute name="style">
                            <xsl:text>visibility: hidden;</xsl:text>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:value-of select="@n"/>
                </xsl:when>
                <xsl:when test="not(@n) and $displayLineNumbers = 'true'">
                    <xsl:value-of select="count(preceding::tei:l[tei:app/tei:rdg[contains(@wit,concat('#',$witnessID))][translate(normalize-space(.), ' ', '') != '']])+1"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="class">
                        <xsl:text>emptynumber</xsl:text>
                    </xsl:attribute>
                    <xsl:text>&#160;</xsl:text>
                </xsl:otherwise>
            </xsl:choose>
        </span>
            </xsl:if>
    </xsl:template>-->

    <xsl:template match="tei:rdg/tei:lb">
        <br class="linebreak"/>
        <br class="linebreak"/>
    </xsl:template>

    <xsl:template match="tei:milestone[@unit='line']">
        <span class="linenumber">
            <xsl:value-of select="@n"/>
        </span>
    </xsl:template>


</xsl:stylesheet>
