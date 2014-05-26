/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be 
 * used to cite it, is:
 *
 *	Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without 
 *	  libraries, toolkits or training: A $1 recognizer for user interface 
 *	  prototypes. Proceedings of the ACM Symposium on User Interface 
 *	  Software and Technology (UIST '07). Newport, Rhode Island (October 
 *	  7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock:
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	//we should note here that since it is direction insensitive, we'll need to take care of that ourselves.
	this.Unistrokes = [];
	this.Unistrokes[0] = new Unistroke("increase speed", [{"X":731,"Y":464},{"X":728.7442479321293,"Y":450.7212396606462},{"X":726,"Y":437.3432693095005},{"X":726,"Y":423.5670485697862},{"X":727.4310696539343,"Y":409.99125621123005},{"X":731.3993626134796,"Y":396.80191215956125},{"X":738.4439430297759,"Y":385.1950712127801},{"X":748.3184959772547,"Y":375.6573034863793},{"X":758.7742933735252,"Y":366.6880888553957},{"X":769.3574792982045,"Y":357.8687672514963},{"X":780.7141355966204,"Y":350.1633510876455},{"X":793.018582655643,"Y":344.04832896725},{"X":805.8580847412408,"Y":339.05518926729525},{"X":819.2171747697681,"Y":335.695706307558},{"X":832.9077501492443,"Y":335},{"X":846.6839708889586,"Y":335},{"X":860.423694110413,"Y":335.91389552883305},{"X":874.1546243754952,"Y":337.0244143750782},{"X":887.7622650243833,"Y":339.1729892143763},{"X":901.4520634237241,"Y":340.6037188159803},{"X":914.7926262204005,"Y":343.59754207346685},{"X":927.7036754238253,"Y":348.37653142659383},{"X":939.9949269640201,"Y":354.5264276258942},{"X":951.7130042393064,"Y":361.71300423930643},{"X":961.4542633434812,"Y":371.45426334348116},{"X":969.2135612920428,"Y":382.82034193806413},{"X":976.2181851410411,"Y":394.6694275291656},{"X":982.8572042165094,"Y":406.74037130274445},{"X":987.8390071094797,"Y":419.58141848464714},{"X":992.784382146978,"Y":432.43939358214294},{"X":996.0177258137209,"Y":445.82533470831345},{"X":997.9440465539335,"Y":459.44046553933464},{"X":998.630311962292,"Y":473.14234832051767},{"X":997.0206811442999,"Y":486.82421027345026},{"X":993.7017050032961,"Y":500.1931799868157},{"X":990.0741557282287,"Y":513.4689180580567},{"X":985.2370016900188,"Y":526.367995493283},{"X":979.6553214805101,"Y":538.9077975324832},{"X":972.5675143840945,"Y":550.7208093598426},{"X":965.5017971571525,"Y":562.5469448328408},{"X":958.5169759741373,"Y":574.4211408439667},{"X":948.1895927145193,"Y":583.2191110250452},{"X":936.8047098837998,"Y":590.9663323792001},{"X":924.8428348897386,"Y":597.6863707169014},{"X":911.7151189957115,"Y":601.8633712286372},{"X":898.6159523625461,"Y":606.1280158791513},{"X":885.2780772695074,"Y":609.4478605119674},{"X":871.6461126822209,"Y":611},{"X":857.9958198723646,"Y":609.665870451879},{"X":844.4629069401941,"Y":607.0881727505132},{"X":831.6971660272612,"Y":601.9341271876958},{"X":818.9643470871632,"Y":596.6749022429641},{"X":806.2348872365077,"Y":591.4075395461412},{"X":793.6493563569826,"Y":585.8246781784912},{"X":781.4057655815147,"Y":579.5175803322942},{"X":769.521943840758,"Y":572.5750611917849},{"X":759.0245097747653,"Y":563.6830065165102},{"X":747.6173924760436,"Y":555.9630443570327},{"X":737.4177318064958,"Y":546.8206871075784},{"X":732,"Y":534.7697954677641},{"X":732,"Y":520.9935747280498},{"X":732,"Y":507.2173539883355},{"X":732,"Y":493.4411332486212},{"X":735,"Y":481}]  );
	this.Unistrokes[1] = new Unistroke("decrease speed", [{"X":720,"Y":389},{"X":718.469901391809,"Y":375.2291125262813},{"X":714.9590978959337,"Y":361.87729368780134},{"X":710.5726029828063,"Y":348.7178089484189},{"X":706.1861080696789,"Y":335.55832420903647},{"X":700.4337384492791,"Y":322.9397666401047},{"X":694.6208505207645,"Y":310.34517612832303},{"X":686.8550237284738,"Y":298.8779502820046},{"X":678.4290305897688,"Y":287.8796506805025},{"X":669.3442828732487,"Y":277.3972494691332},{"X":657.0632999085882,"Y":271.0316499542941},{"X":643.8491063959949,"Y":266.815624762362},{"X":630.4219938515124,"Y":263.745666325084},{"X":616.5733067258187,"Y":262.9593625453161},{"X":602.7644755735844,"Y":261.6442357689128},{"X":588.9237693464395,"Y":261},{"X":575.1221711348782,"Y":262.05037718201623},{"X":561.8378404065664,"Y":265.5945935130247},{"X":549.0535459224882,"Y":270.977454348426},{"X":536.5285925850965,"Y":276.9387654356683},{"X":524.6401952144009,"Y":283.87983267337063},{"X":514.1083078156945,"Y":292.9071647294047},{"X":503.8197036637311,"Y":302.2107443042433},{"X":493.5336273839675,"Y":311.51719427164846},{"X":483.700350621596,"Y":321.299649378404},{"X":473.89184981288594,"Y":331.10815018711406},{"X":466.64616179473325,"Y":342.89229406617153},{"X":459.6568081457054,"Y":354.8740431787908},{"X":456.9338679640718,"Y":368.3967922155693},{"X":455.2584381988621,"Y":382.1571798125167},{"X":454.0025883584956,"Y":395.97152805654844},{"X":455.3333893900185,"Y":409.77835703019144},{"X":456.66953262654516,"Y":423.58517047429996},{"X":461.11272714144394,"Y":436.59636333003584},{"X":466.57690576549385,"Y":449.34611345281894},{"X":472.0556935802611,"Y":462.0881815020801},{"X":479.46287850229726,"Y":473.81622429530404},{"X":487.9138719015677,"Y":484.68364414265193},{"X":498.0149632887053,"Y":494.19055368348734},{"X":509.23077368737984,"Y":502.26769515992305},{"X":520.9141854921413,"Y":509.7450787149704},{"X":533.243097317813,"Y":515.9824518367466},{"X":546.0695983753569,"Y":521.2639522722059},{"X":558.8960994329009,"Y":526.545452707665},{"X":572.2989751425545,"Y":530.0747437856386},{"X":585.7961961256333,"Y":533.2245245157042},{"X":599.5603949922871,"Y":534.9450493740359},{"X":613.3599574039017,"Y":536.2552360668525},{"X":627.2155718561129,"Y":536.9150272312435},{"X":641.0848647107955,"Y":537},{"X":654.9561795810207,"Y":537},{"X":668.8274944512459,"Y":537},{"X":682.0888737709938,"Y":533.4392210220021},{"X":693.4517613717576,"Y":526.2057954457996},{"X":702.6123291093521,"Y":515.8433783490015},{"X":709.1025470031965,"Y":503.5840778828511},{"X":713.3807188270534,"Y":490.4771246917861},{"X":717.275210569653,"Y":477.174368291041},{"X":721.6617054827805,"Y":464.01488355165856},{"X":724.1956025615443,"Y":450.4351795076456},{"X":725,"Y":436.61394461067573},{"X":725,"Y":422.74262974045047},{"X":725,"Y":408.8713148702252},{"X":725,"Y":395} ]  )
	this.Unistrokes[1] = new Unistroke("mute", [{"X":664,"Y":66},{"X":655.5289661388776,"Y":83.94206772224467},{"X":647.0696442507269,"Y":102.32588937318266},{"X":640.2090304356283,"Y":121.37290869311526},{"X":632.949515973367,"Y":140.2582492037323},{"X":626.1170186760393,"Y":159.29610752587564},{"X":619.990691929707,"Y":178.60068250663505},{"X":614.014533692624,"Y":197.95155435791992},{"X":608.1947710904751,"Y":217.35076303174958},{"X":602.9907636284061,"Y":236.92378184824386},{"X":598.1203671902377,"Y":256.5740906107639},{"X":594.2955713442125,"Y":276.463029010095},{"X":590.4707754981873,"Y":296.3519674094261},{"X":587.0046811499267,"Y":316.30446624211885},{"X":583.7627009961589,"Y":336.296677190354},{"X":579.6901331729239,"Y":356.1308197809196},{"X":575.4362346183599,"Y":375.9315799845284},{"X":571.6114387723347,"Y":395.8205183838595},{"X":568.82248727369,"Y":415.8757236289028},{"X":565.8646499155831,"Y":435.90382043896824},{"X":562.0398540695578,"Y":455.79275883829933},{"X":561.2297106852826,"Y":476.02752218265226},{"X":559.5794376668237,"Y":496.2056233317639},{"X":557.4893889308395,"Y":516.3508051570253},{"X":556,"Y":536.5400824503016},{"X":556,"Y":556.7934509088113},{"X":554.999141050057,"Y":577.0051536996581},{"X":551.6695077859557,"Y":596.9829532842657},{"X":548.3398745218544,"Y":616.9607528688733},{"X":544.6370875970135,"Y":636.8145620149321},{"X":536.4479584636214,"Y":654.0693887151715},{"X":523.3902745592729,"Y":669.2194508814541},{"X":511.6683929976122,"Y":685.6632140047756},{"X":500.58276377232943,"Y":702.4172362276705},{"X":487.4783164163317,"Y":715.7608417918342},{"X":474.46831814944454,"Y":728},{"X":490.5489823315654,"Y":730},{"X":510.8023507900752,"Y":730},{"X":531.055719248585,"Y":730},{"X":551.3090877070947,"Y":730},{"X":571.5624561656044,"Y":730},{"X":591.8158246241142,"Y":730},{"X":612.0567693753594,"Y":729.5524017013689},{"X":632.2922191036375,"Y":728.9610374528484},{"X":652.3931876285644,"Y":726.5097102155851},{"X":672.5832274620398,"Y":724.927096567245},{"X":692.7788769758175,"Y":724},{"X":713.0322454343273,"Y":724},{"X":733.285613892837,"Y":724},{"X":753.5389823513467,"Y":724},{"X":773.7923508098564,"Y":724},{"X":794.0457192683662,"Y":724},{"X":814.2822758732768,"Y":723.2598965512146},{"X":834.5297406398404,"Y":723},{"X":854.7588086850183,"Y":722.1245106286101},{"X":875.00872117954,"Y":722},{"X":895.2620896380497,"Y":722},{"X":915.5154580965594,"Y":722},{"X":935.7688265550692,"Y":722},{"X":956.0221950135789,"Y":722},{"X":976.2755634720886,"Y":722},{"X":996.5097986546087,"Y":721.4635858103851},{"X":1016.7466315414899,"Y":721},{"X":1036.9999999999998,"Y":721}]   );
	this.Unistrokes[2] = new Unistroke("size down", [{"X":1766,"Y":717},{"X":1765.697715195063,"Y":699.7404799794288},{"X":1761.6614631505206,"Y":682.9227631271693},{"X":1757.6252111059785,"Y":666.1050462749098},{"X":1753.4676563891678,"Y":649.3210701504527},{"X":1748.2402622635925,"Y":632.834673292869},{"X":1743.0128681380172,"Y":616.3482764352852},{"X":1736.6804990165704,"Y":600.2811227872834},{"X":1729.656217939487,"Y":584.4764903638459},{"X":1722.6319368624038,"Y":568.6718579404084},{"X":1715.6076557853205,"Y":552.8672255169708},{"X":1708.6274134645253,"Y":537.0442345394341},{"X":1702.3456235625308,"Y":520.9300778343178},{"X":1696.0638336605364,"Y":504.8159211292015},{"X":1689.7820437585417,"Y":488.70176442408524},{"X":1684.1092577967743,"Y":472.3824022887097},{"X":1678.954699842053,"Y":455.909399684106},{"X":1666.136748888988,"Y":447.0170936111235},{"X":1651.3739671076523,"Y":453.7931586222801},{"X":1642.061564229724,"Y":468.34261049141094},{"X":1633.732142060623,"Y":483.50000148683733},{"X":1625.5649375001735,"Y":498.74544999967617},{"X":1618.0120764247004,"Y":514.2460346045563},{"X":1612.9763528992014,"Y":530.7919833311956},{"X":1611.0725930109822,"Y":547.9111048352671},{"X":1610,"Y":565.1655693125111},{"X":1610,"Y":582.4608556845214},{"X":1610,"Y":599.7561420565318},{"X":1610,"Y":617.0514284285421},{"X":1610,"Y":634.3467148005524},{"X":1599.1326005423855,"Y":643.6911089429857},{"X":1582.90513795475,"Y":649.6605732669688},{"X":1566.887115255019,"Y":656.1825437593104},{"X":1550.266429316159,"Y":660.5368795816592},{"X":1533.1827859631267,"Y":663.2342969531906},{"X":1516.050572866959,"Y":665.5408570120946},{"X":1498.8263146651607,"Y":667.1066986668036},{"X":1481.6244634040488,"Y":667.1149356084859},{"X":1464.4523741502812,"Y":665.0542848980338},{"X":1447.2802848965136,"Y":662.9936341875816},{"X":1430.108195642746,"Y":660.9329834771295},{"X":1412.9361063889785,"Y":658.8723327666773},{"X":1395.764017135211,"Y":656.8116820562253},{"X":1378.6598866056777,"Y":654.276647767613},{"X":1361.59992121739,"Y":651.4333202028984},{"X":1344.5399558291022,"Y":648.5899926381837},{"X":1327.4799904408144,"Y":645.7466650734691},{"X":1310.4200250525266,"Y":642.9033375087545},{"X":1293.3600596642389,"Y":640.0600099440398},{"X":1276.3597181977511,"Y":636.8799471620783},{"X":1259.360662257638,"Y":633.6926241733071},{"X":1242.361606317525,"Y":630.5053011845359},{"X":1225.362550377412,"Y":627.3179781957647},{"X":1208.3634944372989,"Y":624.1306552069935},{"X":1191.2906535721609,"Y":621.4713568122371},{"X":1174.0690334621047,"Y":619.8767623576023},{"X":1156.8474133520485,"Y":618.2821679029674},{"X":1139.6113599193818,"Y":617},{"X":1122.3160735473716,"Y":617},{"X":1105.0207871753614,"Y":617},{"X":1087.7255008033512,"Y":617},{"X":1070.430214431341,"Y":617},{"X":1053.1946267086212,"Y":618.137407714882},{"X":1036.000000000001,"Y":619.9999999999999},]  );
	this.Unistrokes[3] = new Unistroke("size up", [{"X":519,"Y":844},{"X":519,"Y":829.6223385224238},{"X":518.4538579593225,"Y":815.2617273491596},{"X":518,"Y":800.8982351091527},{"X":518.7969254971708,"Y":786.613066637024},{"X":522.1290555986108,"Y":772.628965153994},{"X":526.8524139324181,"Y":759.0493099442978},{"X":531.7814014807691,"Y":745.5464962980774},{"X":537.1211309013164,"Y":732.1971727467089},{"X":544.1797289142653,"Y":719.7004518095579},{"X":552.0112454430391,"Y":707.687067740505},{"X":561.4455608750187,"Y":696.8376049937284},{"X":571.1242770543411,"Y":686.2692199146783},{"X":583.1791355375465,"Y":678.4335619005948},{"X":595.9221665154919,"Y":672.025944494836},{"X":609.8087848006468,"Y":669},{"X":621.2176106017624,"Y":676.5393716619387},{"X":630.4447083459062,"Y":687.5312453885311},{"X":638.2795621495288,"Y":699.5591242990578},{"X":644.709447833797,"Y":712.4188956675939},{"X":647.6922758476097,"Y":726.4613792380485},{"X":648.5816072043089,"Y":740.7953584947954},{"X":648.4499145167231,"Y":755.1341311772512},{"X":646.9182173289608,"Y":769.4299715963655},{"X":644.7507879043405,"Y":783.6214544304677},{"X":641.5337554473595,"Y":797.6318559342419},{"X":637.5210422198709,"Y":811.4368733403873},{"X":631.6553155457049,"Y":824.4595792723935},{"X":632.7160675905684,"Y":831},{"X":647.0879636683704,"Y":830.7577160157919},{"X":661.4493516133094,"Y":830.0738403993662},{"X":675.7992089495169,"Y":829.1830292159883},{"X":690.1476705880174,"Y":828.2671699624669},{"X":704.4961322265178,"Y":827.3513107089457},{"X":718.8148982051298,"Y":826.0817814369657},{"X":733.115184987527,"Y":824.592168230466},{"X":747.4154717699241,"Y":823.1025550239663},{"X":761.7222150215199,"Y":821.6809529981555},{"X":776.0473498557596,"Y":820.4530842980778},{"X":790.3724846899994,"Y":819.2252155980001},{"X":804.6976195242391,"Y":817.9973468979224},{"X":819.0227543584789,"Y":816.7694781978447},{"X":833.3556103866947,"Y":815.6429593075537},{"X":847.701427613707,"Y":814.6865714924196},{"X":862.0472448407193,"Y":813.7301836772854},{"X":876.3998859054427,"Y":812.9306145733583},{"X":890.7745542193605,"Y":812.6372539955232},{"X":905.1492225332784,"Y":812.3438934176882},{"X":919.5238908471962,"Y":812.0505328398531},{"X":933.9010367372285,"Y":812},{"X":948.2786982148048,"Y":812},{"X":962.6545511746535,"Y":812.1664032864055},{"X":977.0288164879029,"Y":812.4788873149544},{"X":991.4030818011522,"Y":812.7913713435033},{"X":1005.7784758438005,"Y":813},{"X":1020.1561373213767,"Y":813},{"X":1034.5294244932402,"Y":812.7112295608109},{"X":1048.9004891998898,"Y":812.2757427515185},{"X":1063.2685338238473,"Y":811.7605211898251},{"X":1077.6313653217394,"Y":811.1076652126482},{"X":1091.989985981026,"Y":810.3689481062618},{"X":1106.2459832749078,"Y":808.7212970691339},{"X":1120.412070962239,"Y":806.2646548396268},{"X":1133.9999999999998,"Y":803}]  );
	this.Unistrokes[4] = new Unistroke("volume full", [{"X":589,"Y":717},{"X":589,"Y":701.3360390513975},{"X":588.5660197591565,"Y":685.6786520521648},{"X":588.0915720622883,"Y":670.0218780555115},{"X":586.9784311906737,"Y":654.4006513516432},{"X":585.7125345782949,"Y":638.7879264656373},{"X":584.446637965916,"Y":623.1752015796313},{"X":583.1807413535372,"Y":607.5624766936254},{"X":582.0296697739725,"Y":591.9467230239774},{"X":582.4707331548217,"Y":576.2889730038303},{"X":582.9117965356709,"Y":560.6312229836832},{"X":583.3528599165201,"Y":544.9734729635361},{"X":583.7939232973694,"Y":529.315722943389},{"X":585.6366550607906,"Y":513.8167246960465},{"X":588.708610542986,"Y":498.45694728506976},{"X":591.7805660251813,"Y":483.09716987409297},{"X":594.8525215073768,"Y":467.73739246311624},{"X":597.634408362987,"Y":452.32258197764406},{"X":600.4016673436101,"Y":436.90499622845806},{"X":602.3962870214993,"Y":421.3952163083435},{"X":603.3344375245842,"Y":405.7593745902618},{"X":604.2725880276691,"Y":390.12353287218014},{"X":604.3625572882288,"Y":374.5395967075278},{"X":601.5248360675481,"Y":359.13482436669},{"X":598.6871148468675,"Y":343.7300520258522},{"X":595.2031567569773,"Y":328.4630216225313},{"X":591.5127271561523,"Y":313.2399995191283},{"X":590.5765761098552,"Y":297.7747822423171},{"X":591.5212142948482,"Y":282.1393569875811},{"X":592.5351034048059,"Y":266.5085523327166},{"X":591.3158190909242,"Y":251.01770181826242},{"X":586.5834336290997,"Y":236.19070543794203},{"X":581.1528634878147,"Y":221.53502220735126},{"X":579,"Y":206.17258043535273},{"X":579,"Y":190.5086194867503},{"X":577.3304721479313,"Y":174.9828328875884},{"X":576.2349237165387,"Y":159.40954229923224},{"X":576,"Y":143.7650242318376},{"X":574.7920639886969,"Y":128.16825595478736},{"X":571.0993077306682,"Y":112.94688478800715},{"X":569,"Y":97.48635982926663},{"X":568.471854151442,"Y":81.88741660576828},{"X":567.2707506938524,"Y":66.353753469262},{"X":571.1520665820067,"Y":53.949311139331115},{"X":586.3152201660088,"Y":50.136955966798254},{"X":601.8176342273,"Y":48.01823657727},{"X":617.4038579171564,"Y":46.459614208284364},{"X":633.0448953216447,"Y":46},{"X":648.7088562702472,"Y":46},{"X":664.3665146549473,"Y":46.13139563989878},{"X":679.9585628146604,"Y":47.63063103987119},{"X":695.5506109743734,"Y":49.1298664398436},{"X":711.1426591340864,"Y":50.62910183981601},{"X":726.7658716466582,"Y":51.73536697791614},{"X":742.3993282606662,"Y":52.712458016291635},{"X":758.0454794284514,"Y":53.44181917713806},{"X":773.6812126362828,"Y":54.24017323375468},{"X":789.2201065473458,"Y":56},{"X":804.8840674959483,"Y":56},{"X":820.5392269383044,"Y":56.211602244858696},{"X":836.170394814361,"Y":57},{"X":851.8343557629635,"Y":57},{"X":867.498316711566,"Y":57},{"X":883,"Y":58}] );
	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		points = Resample(points, NumPoints);

		console.log(JSON.stringify(points));
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}
//
// Private helper functions from this point down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }