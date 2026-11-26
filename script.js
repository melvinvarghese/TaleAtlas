(() => {
  const stories = window.TALEATLAS_STORIES || [];
  const $ = (id) => document.getElementById(id);
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

  const artwork = {
    'lion-mouse': {
      alt: 'A small mouse gnaws through the rope net holding a tawny lion in a sunlit forest clearing.'
    },
    'monkey-crocodile': {
      alt: 'A clever monkey sits safely in a fruit tree above a crocodile waiting at the riverbank.'
    },
    momotaro: {
      alt: 'An elderly Japanese couple discover a cheerful baby nestled inside a giant peach beside a stream.'
    },
    'anansi-wisdom': {
      alt: 'Anansi, a small eight-legged spider, climbs a tree with a round clay pot tied in front.'
    },
    'tortoise-hare': {
      alt: 'A steady tortoise nears a woodland finish line while a hare naps beneath a tree.'
    },
    'stone-soup': {
      alt: 'Travellers and villagers gather around a steaming pot as vegetables are added to make soup.'
    },
    'bremen-musicians': {
      alt: 'A donkey, dog, cat, and rooster stand together outside a quiet woodland cottage at night.'
    },
    'boy-wolf': {
      alt: 'A young shepherd watches his flock on a green hillside as a wolf approaches in the distance.'
    },
    'porridge-pot': {
      alt: 'A small enchanted pot overflows with golden porridge from a cottage doorway into the village street.'
    },
    'fisherman-wife': {
      alt: 'A fisherman releases a shimmering fish into a blue-grey sea near a humble cottage.'
    },
    'clever-rabbit': {
      alt: 'A small rabbit leads a roaring lion toward a deep stone well in a leafy forest.'
    },
    'grateful-crane': {
      alt: 'A red-crowned white crane works at a wooden loom in a quiet snowy cottage.'
    },
    'how-the-rajas-son-won-the-princess-labam': {
      alt: 'A young prince follows a green parrot toward Princess Labam’s shining palace as animals gather along the garden path.'
    },
    'the-lambikin': {
      alt: 'A little white lamb reaches a cottage garden where an elderly woman welcomes it and woodland animals watch.'
    },
    punchkin: {
      alt: 'A brave prince discovers a jeweled birdcage in a palace courtyard while a magician and royal family look on.'
    },
    'the-magic-fiddle': {
      alt: 'A family listens together as a softly glowing bamboo fiddle brings Mira’s memory into their home.'
    },
    'loving-laili': {
      alt: 'Prince Majnun meets fairy Laili beside a lotus lake while his loyal friend Husain stands nearby.'
    },
    'the-soothsayers-son': {
      alt: 'Gangazara helps a bird and deer beside a village road as the grateful animals gather around him.'
    },
    harisarman: {
      alt: 'Harisarman speaks honestly in a village courtyard while a ruler and neighbors listen with understanding.'
    },
    'the-charmed-ring': {
      alt: 'A young merchant’s son finds his jeweled ring again with help from a bird, monkey, and small deer.'
    },
    'the-talkative-tortoise': {
      alt: 'A tortoise grips a stick between two flying ducks above green hills on their journey to a mountain.'
    },
    'the-gold-giving-serpent': {
      alt: 'A farmer’s family offers milk to a graceful golden serpent beside a single coin in the garden.'
    },
    'the-farmer-and-the-money-lender': {
      alt: 'A farmer raises a carved conch that pours water into a village field as neighbors watch.'
    },
    'raja-rasalu': {
      alt: 'Raja Rasalu returns from his journey to embrace his family beside a stone well and palace garden.'
    },
    'the-boy-who-had-a-moon-on-his-forehead-and-a-star-on-his-chin': {
      alt: 'A young prince with a moon mark and star mark is recognized by his family in a palace garden.'
    },
    'the-demon-with-the-matted-hair': {
      alt: 'A prince calmly untangles his weapons from a large demon’s knotted hair on a forest path.'
    },
    'lifes-secret': {
      alt: 'A prince reveals a shining necklace and a magical fish beside a lotus pond to a worried loved one.'
    },
    'phakir-chand': {
      alt: 'A clever young man uses a shining jewel to reunite two friends in a luminous underwater palace.'
    },
    'the-story-of-the-rakshasas': {
      alt: 'A Brahman and his wife meet a lonely rakshasi in a glittering palace and begin to welcome her.'
    },
    'the-story-of-swet-basanta': {
      alt: 'Two brothers reunite on a forest path beside a gentle elephant, a traveler, and a cheerful calf.'
    },
    'my-lord-bag-of-rice': {
      alt: 'A Japanese archer stands beside a dragon king at a lake palace as a many-legged creature retreats.'
    },
    'the-tongue-cut-sparrow': {
      alt: 'A kind woodcutter reunites with his sparrow friend in a bamboo grove among the bird’s family.'
    },
    'the-story-of-urashima-taro-the-fisher-lad': {
      alt: 'Urashima Taro rides a sea turtle toward a glowing underwater palace filled with friendly sea folk.'
    },
    'the-farmer-and-the-badger': {
      alt: 'A Japanese farmer shares fallen turnips with a small badger beside an autumn vegetable field.'
    },
    'the-adventures-of-kintaro-the-golden-boy': {
      alt: 'Kintaro leads a playful, fair wrestling match with a bear, deer, monkey, and hare in a mountain clearing.'
    },
    'the-story-of-princess-hase': {
      alt: 'Princess Hase and her loyal helper wait beneath a flowering tree as her father approaches through the woods.'
    },
    'the-story-of-the-man-who-did-not-wish-to-die': {
      alt: 'Sentaro looks across the water from a peaceful enchanted island toward his distant home.'
    },
    'the-bamboo-cutter-and-the-moon-child': {
      alt: 'The bamboo-cutter and his wife say goodbye as their daughter rises toward a moonlit procession.'
    },
    'the-mirror-of-matsuyama': {
      alt: 'A Japanese daughter holds her mother’s round mirror as her father understands her affection.'
    },
    'the-goblin-of-adachigahara': {
      alt: 'A pilgrim keeps watch with a lantern in a lonely cottage as dawn brightens the doorway.'
    },
    'womens-words-part-flesh-and-blood': {
      alt: 'A Chinese farmer admires a tall millet sprout while his older brother watches from the field.'
    },
    'the-three-rhymsters': {
      alt: 'A farmer and his clever wife turn a Chinese birthday feast rhyme contest into a joyful scene.'
    },
    'the-magic-cask': {
      alt: 'A Chinese farmer offers a cap to his grandfather beside an old cask in the family home.'
    },
    'the-bird-with-nine-heads': {
      alt: 'A shepherd helps a princess leave a cliffside cave as a nine-headed bird flies overhead.'
    },
    'the-great-flood': {
      alt: 'A boy and his mother guide rescued animals and a traveler onto a wooden raft above floodwater.'
    },
    'the-herd-boy-and-the-weaving-maiden': {
      alt: 'A herdboy and a weaving maiden meet across a shimmering river of stars beneath the night sky.'
    },
    'the-lady-of-the-moon': {
      alt: 'Chang’e stands in a moonlit garden above Earth and looks gently toward the people she loves.'
    },
    'the-girl-with-the-horses-head-or-the-silkworm-goddess': {
      alt: 'A young woman and her father stand with a white horse as their village gathers silk together.'
    },
    'per-gynt': {
      alt: 'Per Gynt guides a muddled troll with a lantern beside a shepherd’s hut in the Norwegian mountains.'
    },
    'the-isle-of-udrost': {
      alt: 'Fisherman Isaac approaches a hidden green island where new friends welcome his small boat.'
    },
    'the-three-lemons': {
      alt: 'A traveler discovers three glowing lemons and three sisters in a sunlit European orchard.'
    },
    'the-neighbor-underground': {
      alt: 'A farmer and a tiny underground neighbor discuss moving a stable beside a country cottage.'
    },
    'the-troll-wedding': {
      alt: 'A clever dog helps a young herder recognize a troll wedding in a Norwegian mountain pasture.'
    },
    'the-hat-of-the-huldres': {
      alt: 'An enchanted hat lies at a rustic wedding while puzzled guests look for the invisible farmhand.'
    },
    'the-magic-apples': {
      alt: 'A young traveler helps a princess with comical silver horns in a palace garden.'
    },
    'east-of-the-sun-and-west-of-the-moon': {
      alt: 'A brave girl rides a polar bear across snowy mountains toward an enchanted palace.'
    },
    'kari-woodencoat': {
      alt: 'Princess Kari rides beside a friendly blue bull through an enchanted Nordic forest.'
    },
    'soria-moria-castle': {
      alt: 'Halvor stands before a radiant Nordic castle with three princesses and a winding mountain path.'
    },
    'connla-and-the-fairy-maiden': {
      alt: 'Connla and a fairy maiden sail toward a green island as his homeland fades behind them.'
    },
    guleesh: {
      alt: 'Guleesh and a princess ride safely with the fairies above moonlit Irish hills and cottages.'
    },
    'the-field-of-boliauns': {
      alt: 'Tom meets a small leprechaun among green boliaun plants beside a little pot of gold.'
    },
    'the-horned-women': {
      alt: 'A wool-worker listens calmly to horned visitors beside a stone well in an Irish village.'
    },
    'conall-yellowclaw': {
      alt: 'Conall and his three sons bring a fine brown horse home through the Irish countryside.'
    },
    'hudden-and-dudden-and-donald-oneary': {
      alt: 'A poor Irish farmer shares a harvest meal with two neighbors around a rustic table.'
    },
    'the-tortoise-with-a-pretty-daughter': {
      alt: 'Adet teaches a song to children in a Southern Nigerian palace courtyard as her father Tortoise watches.'
    },
    'the-kings-magic-drum': {
      alt: 'Tortoise carries the king’s carved drum toward a village feast, with a fallen branch on the path.'
    },
    'ituen-and-the-kings-wife': {
      alt: 'Ituen explains how to share market produce with Queen Attem at a village table.'
    },
    'of-the-pretty-stranger-who-killed-the-king': {
      alt: 'A mysterious stranger stands in a palace courtyard at twilight as a canoe glides through distant creeks.'
    },
    'the-disobedient-daughter-who-married-a-skull': {
      alt: 'Afiong meets a kindly elder as the traveler’s handsome appearance fades to a harmless skull-like face.'
    },
    'the-king-who-married-the-cocks-daughter': {
      alt: 'Adia, an anthropomorphic hen, stands with her rooster father as the king apologizes and welcomes her back.'
    },
    'concerning-the-woman-the-ape-and-the-child': {
      alt: 'A gentle ape returns a wooden rattle to a baby beneath a shade tree while the parents watch.'
    },
    'the-fish-and-the-leopards-wife': {
      alt: 'A fish apologizes to a leopard woman and brings a fresh basket of fruit beside the river.'
    },
    'why-the-worms-live-underneath-the-ground': {
      alt: 'Small worms slip beneath the earth as a line of ants passes while King Eyo watches.'
    },
    'why-the-sun-and-the-moon-live-in-the-sky': {
      alt: 'The Sun and Moon rise above a crowded courtyard filled by their friend Water and his creatures.'
    },
    'the-story-of-the-lightning-and-the-thunder': {
      alt: 'A young ram flashes among clouds while his ewe mother follows above a quiet town.'
    },
    'why-dead-people-are-buried': {
      alt: 'A sheep stands beside a flower-marked patch of earth as a dog returns with a forgotten message.'
    },
    'of-the-fat-woman-who-melted-away': {
      alt: 'A woman made of palm oil rises whole from a clay pot beneath a shade tree as her family welcomes her.'
    },
    'the-king-and-the-ju-ju-tree': {
      alt: 'King Udo and his daughter listen beneath a Ju Ju tree whose roots protect a clear spring.'
    },
    'of-the-pretty-girl-and-the-seven-jealous-women': {
      alt: 'A kind river guardian returns Akim safely to shore as her parents offer gifts and a small bird watches.'
    },
    'the-lucky-fisherman': {
      alt: 'A fisherman sets woven fish baskets at a shaded river bend while neighbors watch and learn.'
    },
    'the-orphan-boy-and-the-magic-stone': {
      alt: 'Ayong returns a glowing stone to an elderly woman by a stream as villagers gather at his welcoming home.'
    },
    'concerning-the-fate-of-essido-and-his-evil-companions': {
      alt: 'Brothers Eyo and Essido work together at a riverside stall selling yams and fish.'
    },
    'the-story-of-the-drummer-and-the-alligators': {
      alt: 'Edet plays his drum at a riverside celebration beside his mother and guide, with calm alligators in the distance.'
    },
    'the-election-of-the-king-bird': {
      alt: 'A black-and-white fishing eagle perches above a peaceful assembly of birds and a king by the river.'
    },
    'pride-goeth-before-a-fall': {
      alt: 'Ten fully clothed merchants work together to recover cloth from three safely restrained robbers on a forest path.'
    },
    'the-broken-pot': {
      alt: 'A Bengali Brahman looks down at a broken earthen pot and scattered rice inside his humble home.'
    },
    'the-tiger-the-brahman-and-the-jackal': {
      alt: 'A jackal shuts a tiger back inside a wooden cage while a relieved Brahman watches from the forest.'
    },
    'a-lesson-for-kings': {
      alt: 'Two Indian kings step down from their chariots to courteously yield a narrow forest road.'
    },
    'how-the-wicked-sons-were-duped': {
      alt: 'Two sons open sacks of stones and gravel in their family courtyard, finding no treasure.'
    },
    'the-indigent-brahman': {
      alt: 'A poor Brahman shows mercy to a wealthy landholder as gentle spirits fade from an earthen pot.'
    },
    'the-bears-bad-bargain': {
      alt: 'A black bear eats an orchard pear while a woodman and his wife share ripe fruit and a meal in their courtyard.'
    },
    'the-jackal-and-the-iguana': {
      alt: 'A jackal wearing old shoes as ornaments boasts above a pile of bones while an iguana sings from a burrow.'
    },
    'the-sandy-road': {
      alt: 'A caravan attendant breaks a buried stone and water springs from the sand as travelers gather.'
    },
    'the-story-of-chullaka-the-treasurer': {
      alt: 'Chullaka weighs grain for a fair trade in an ancient Indian market.'
    },
    'the-measure-of-rice': {
      alt: 'A wise valuer measures rice on a balance scale while a king watches from the court.'
    },
    'the-banyan-deer': {
      alt: 'The Banyan Deer stands between a king and a pregnant doe as the king lowers his bow.'
    },
    'the-greedy-antelope': {
      alt: 'A king releases an unharmed antelope from a loose rope near the forest edge.'
    },
    'the-wily-antelope': {
      alt: 'An alert antelope notices a hunter’s hidden trap beside a tree and slips into tall grass.'
    },
    'the-dog-who-turned-preacher': {
      alt: 'A dog holds a worn leather sandal before a seated king as attendants feed dogs in the palace courtyard.'
    },
    'the-elephant-and-the-dog': {
      alt: 'A kneeling elephant gently greets his small dog friend as the king watches their reunion.'
    },
    'the-bull-who-won-the-bet': {
      alt: 'A farmer apologizes to a friendly bull before it resumes pulling a wooden cart.'
    },
    'the-holy-quail': {
      alt: 'A tiny quail stays safe in its nest as an orange forest fire curves around it.'
    },
    'the-partridge-monkey-and-elephant': {
      alt: 'A partridge, monkey, and elephant gather beneath an old tree and listen to one another.'
    },
    'nanda-on-the-buried-gold': {
      alt: 'Nanda and a wise adviser uncover family treasure as Nanda shares coins with neighbors.'
    },
    'the-speaking-horse': {
      alt: 'A court scholar stands beside a calm horse as a king listens from a shaded palace pavilion.'
    },
    'concerning-a-man-and-two-yakas': {
      alt: 'A farmer and his wife receive baskets of grain from two shy yakā spirits at their forest-edge home.'
    },
    'the-jackal-and-the-turtle': {
      alt: 'A turtle rides on a jackal’s back toward a pond, ready to slip into the water and escape.'
    },
    'the-grateful-jackal': {
      alt: 'A grateful jackal carries a boy’s cloth to two workers while the boy waits safely in a clearing with a python nearby.'
    },
    'how-gourds-were-put-in-small-mouthed-pots': {
      alt: 'A clever girl carefully places tiny gourd fruits into narrow-mouthed copper pots as the king watches.'
    },
    'the-story-of-the-two-liars': {
      alt: 'Two boastful storytellers inspect a cloth bundle and discover tiny lice instead of imagined elephants.'
    },
    'the-frightened-yaka': {
      alt: 'A young helper reminds a yakā that the queen is its mother as the spirit retreats from the palace.'
    },
    'how-the-sun-the-moon-and-the-wind-went-out-to-dinner': {
      alt: 'The Moon saves food for the Star mother while the Sun and Wind return empty-handed from dinner.'
    },
    'how-the-cat-came-to-live-with-man': {
      alt: 'Children gently stroke a small cat near their cottage as a tiger watches from the trees.'
    },
    'the-lost-book': {
      alt: 'A Khasi elder and community gather beside a river with a water-damaged book and shared traditions.'
    },
    'the-merchant-of-seri': {
      alt: 'An honest merchant offers his wares for an old woman’s gold bowl as a rival watches from the market.'
    },
    'the-girl-monkey-and-the-string-of-pearls': {
      alt: 'A clever monkey holds the queen’s pearl necklace near a tree while a guard watches a glass-bead decoy.'
    },
    'the-three-fishes': {
      alt: 'One fish splashes beside a fisherman’s net as two other fish escape through a loosened corner.'
    },
    'the-red-bud-tree': {
      alt: 'A father points out the seasons of one tree to four princes as they compare what they saw.'
    },
    'the-hawks-and-their-friends': {
      alt: 'A hawk family gathers with a kingfisher, turtle, and lion after they help drive hunters away.'
    },
    'the-wolf-and-the-lamb': {
      alt: 'A shepherd leads a small lamb safely away from a gray wolf beside a clear stream in the Greek hills.'
    },
    'the-ass-and-the-grasshopper': {
      alt: 'An ass listens to grasshoppers singing among dew-covered meadow grasses in a sunlit Greek field.'
    },
    'the-wolf-and-the-crane': {
      alt: 'A long-beaked crane lifts a bone from a wolf’s open mouth beside an olive grove.'
    },
    'the-father-and-his-sons': {
      alt: 'A Greek father shows his three sons how a tied bundle of slender sticks resists bending.'
    },
    'the-bat-and-the-weasels': {
      alt: 'A small brown bat calmly speaks with two weasels at separate paths beneath an olive tree at twilight.'
    },
    'the-cock-and-the-jewel': {
      alt: 'A red-and-gold rooster compares a bright jewel with a grain of barley while his hens wait nearby.'
    },
    'the-swallow-and-the-crow': {
      alt: 'A swallow and a crow share an olive branch as spring sunlight and a cool breeze pass over the garden.'
    },
    'the-dog-and-the-shadow': {
      alt: 'A small dog peers into a clear stream from a stone bridge, holding bread as its reflection ripples below.'
    },
    'hercules-and-the-wagoner': {
      alt: 'A wagoner braces his shoulder against a muddy wheel while oxen pull the cart and Hercules watches beside the lane.'
    },
    'the-mole-and-his-mother': {
      alt: 'A young mole sniffs a fragrant sprig held by his mother beside their hillside burrow.'
    },
    'the-fawn-and-his-mother': {
      alt: 'A young fawn stands close to his mother beneath an oak while a distant dog barks across the meadow.'
    },
    'the-ass-the-fox-and-the-lion': {
      alt: 'A donkey brays on a country path as a surprised lion pauses and a fox lingers behind the olive trees.'
    },
    'the-flies-and-the-honey-pot': {
      alt: 'A kitchen helper uses a leaf to lift flies from a spilled honey jar as the little insects rest on the plate.'
    },
    'the-farmer-and-the-snake': {
      alt: 'A farmer guides a snake away from a warm stone with a long branch toward the sunny meadow grass.'
    },
    'the-man-and-the-lion': {
      alt: 'A traveler and a lion study a stone statue of a man standing over a lion in a Greek forest clearing.'
    },
    'the-mountain-in-labor': {
      alt: 'A tiny mouse peeks out from a mountain’s hillside while shepherds and villagers watch from a safe distance.'
    },
    'the-bear-and-the-fox': {
      alt: 'A brown bear holds a low olive branch aside as a family carrying baskets passes, while a fox watches.'
    },
    'the-tortoise-and-the-eagle': {
      alt: 'An eagle carries a tortoise high above rocky hills beneath wide clouds, with the tortoise held safely in flight.'
    },
    'the-fox-and-the-goat': {
      alt: 'A shepherd lowers a rope and bucket into a stone well toward a goat in the water, as a fox hurries away along the path.'
    },
    'the-raven-and-the-swan': {
      alt: 'A dark raven watches a white swan on the lake, then turns toward berries on the sunlit bank.'
    },
    'the-dragon-princess': {
      alt: 'Two messengers present jade gifts to the Dragon-Princess at her luminous castle gate, with a small dragon and shining pearls nearby.'
    },
    'the-frog-princess': {
      alt: 'Sia apologizes to the Frog Princess beside the Yangtze River as her frog family gathers around their peaceful home.'
    },
    'the-evil-eye-of-sani': {
      alt: 'Sribatsa and Chintamani reunite aboard a riverboat as evening light breaks through clouds above the green riverbank.'
    },
    'the-ghost-brahman': {
      alt: 'A young cowherd presents a tiny glass bottle to reveal the ghostly double beside the real Brahman as their king watches.'
    },
    'munachar-and-manachar': {
      alt: 'Munachar and Manachar share a cake beside raspberry bushes and full berry baskets in an Irish cottage garden.'
    },
    'king-otoole-and-his-goose': {
      alt: 'King O’Toole and Kavin look on as the king’s restored white goose flies above a lake and green Irish hills.'
    },
    'salmon-of-knowledge-fionn': {
      alt: 'Young Fionn carefully turns the Salmon of Knowledge over a hearth as the poet Finnegas returns with firewood.'
    },
    'the-brewery-of-eggshells': {
      alt: 'A mother stirs a tiny eggshell pot by the hearth while one baby sits up with a surprisingly wise expression.'
    },
    'how-we-got-the-name-spider-tales': {
      alt: 'Anansi meets Nyankupon beneath a broad tree, with a glimmering web and objects from the spider’s clever tasks nearby.'
    },
    'the-squirrel-and-the-spider': {
      alt: 'Squirrel looks on as Spider and his children carry harvest bundles while Crow claims one beside a woodland farm.'
    },
    'the-leopard-and-the-ram': {
      alt: 'A ram builds a leafy shelter in a clearing while a wary leopard watches from the forest edge, mistaking the work for a threat.'
    },
    'to-lose-an-elephant-for-the-sake-of-a-wren': {
      alt: 'Spider pauses beside a tiny wren as the elephant he won wanders away along a woodland path.'
    },
    'farmer-mybrow-and-the-fairies': {
      alt: 'A farmer’s wife lifts a ripe yam as small fairies watch from the forest edge beside a flourishing field.'
    },
    'affair-of-the-hippopotamus-and-the-tortoise': {
      alt: 'A tortoise listens from the riverside reeds as a hippopotamus and his wife pause on the path.'
    },
    'how-the-tortoise-overcame-the-elephant-and-the-hippopotamus': {
      alt: 'A tortoise reveals his rope trick beside a palm tree as a hippo surfaces and an elephant watches.'
    },
    'the-story-of-the-fairy-bee': {
      alt: 'A small bee guides Kintu across a Ugandan grassland toward a distant herd and his missing cow.'
    },
    'the-story-of-the-hippos': {
      alt: 'A messenger crosses a broad river on a floating bridge of calm hippos after a storm.'
    },
    'the-hare-and-the-lion-zanzibar': {
      alt: 'A quick hare perches above a hollow calabash tree as a lion watches the honey below.'
    },
    'the-lion-the-hyena-and-the-rabbit-zanzibar': {
      alt: 'Rabbit, Lion, and Hyena share the harvest at their farm after making a fairer agreement.'
    },
    'the-blacksmith-and-the-blackbirds': {
      alt: 'A turtle-dove witnesses blackbirds offering beeswax to a blacksmith to settle their debt.'
    },
    'man-and-turtle-angola': {
      alt: 'A turtle swims happily into a river while people watch from the grassy bank.'
    },
    'elephant-and-frog-angola': {
      alt: 'A frog rides on a calm elephant toward a village gathering as people greet them.'
    },
    'jackal-and-hare-angola': {
      alt: 'A wide-eyed hare peeks from a burrow as a startled jackal hurries away through the bush.'
    },
    'squirrel-and-the-kingship': {
      alt: 'An impatient squirrel waits beside an unfinished royal wrap as villagers prepare a modest ceremony.'
    },
    'dog-and-the-kingship': {
      alt: 'A dog runs away carrying a piece of cooked chicken as musicians and guests look on during a village ceremony.'
    },
    'dog-and-jackal-angola': {
      alt: 'A content dog enjoys a bowl of mush in a village while a jackal lingers beside the path.'
    },
    'the-story-of-the-frog-uganda': {
      alt: 'A kind suitor steps carefully around a frog as a young woman watches from the garden shade.'
    },
    'hare-earned-cow-and-chieftainship': {
      alt: 'A hare is welcomed as chief beside a living cow and a festive gathering of animals at a fenced yard.'
    },
    'the-man-who-knew-too-much': {
      alt: 'A gardener rests in a plum garden and listens to his friend beside a fallen ripe plum.'
    },
    'the-caterpillar-and-the-wild-animals': {
      alt: 'A tiny caterpillar faces a bold frog as an elephant, rhinoceros, jackal, and leopard watch nearby.'
    },
    'how-the-turtle-outwitted-the-pig': {
      alt: 'Pig carries Turtle away, mistaking the quiet, stone-disguised turtle for a whetstone.'
    },
    'cunning-rabbit-and-his-well': {
      alt: 'Rabbit shares water from a great cup as thirsty animals gather around the well after a drought.'
    },
    'the-lion-the-hyena-and-the-fox': {
      alt: 'A quick fox escapes as a lion reaches after it across open ground in an Ethiopian landscape.'
    },
    'the-elephant-and-the-rabbit-zanzibar': {
      alt: 'Rabbit slips away as his wax horns melt and Hyena notices him at Elephant’s dance.'
    },
    'the-little-iron-house': {
      alt: 'The rabbit girl waits in the doorway of her small iron house as Rabbit approaches from the yard.'
    },
    'the-past-and-the-future': {
      alt: 'An Angolan folktale judge explains his decision to two travelers listening before him.'
    },
    'morning-sunrise': {
      alt: 'Thinker arrives solemnly at the family’s home, believing the young woman has died and coming to mourn.'
    },
    'the-story-of-the-animals-and-the-fruit': {
      alt: 'Tortoise speaks beneath a tree as fruit falls and the gathered animals watch.'
    },
    'the-story-of-the-fairy-foxes': {
      alt: 'A fairy fox calls in Mukono Forest, its wings made of soft, swirling night mist.'
    },
    'the-story-of-the-two-friends-uganda': {
      alt: 'A hare listens kindly to a withdrawn boy in a quiet forest clearing at dusk.'
    },
    'the-cheats-of-kijongo': {
      alt: 'Two market cheats open exchanged parcels and find rags and ant wings inside.'
    },
    'the-lioness-and-the-antelope': {
      alt: 'A calm antelope greets a paused, ashamed lioness in an open grassy setting on Tanzania’s Swahili coast.'
    },
    'charcoal-burner-and-fuller': {
      alt: 'A fuller politely declines a charcoal-burner’s invitation, holding a white cloth as they speak.'
    },
    'boy-hunting-locusts': {
      alt: 'A boy pauses before a raised-tail scorpion, with the locusts he has caught gathered nearby.'
    },
    'fisherman-piping': {
      alt: 'A smiling fisherman hauls a net of leaping fish from the water after stopping his flute playing.'
    },
    'pomegranate-apple-tree-bramble': {
      alt: 'A bramble raises its stems to interrupt a pomegranate and apple-tree arguing nearby.'
    },
    'dog-in-the-manger': {
      alt: 'A dog guards a manger full of hay while two oxen watch from beyond its reach.'
    },
    'oxen-and-axle-trees': {
      alt: 'Oxen pull a loaded wagon along a country lane, glancing back toward its groaning axle-trees.'
    },
    'boasting-traveler': {
      alt: 'A bystander gestures for the traveler to demonstrate his claimed long jump as listeners watch.'
    },
    'boy-and-filberts': {
      alt: 'A boy draws his hand from a narrow pitcher with a small handful of filberts as a bystander watches.'
    },
    'belly-and-members': {
      alt: 'A seated, fully clothed figure with a rounded belly eats bread and a fig on a stone bench in a pale courtyard.'
    },
    'father-and-his-two-daughters': {
      alt: 'A daughter gestures toward gathering rain clouds in a garden while her elderly father listens beside rows of vegetables.'
    },
    'old-woman-and-wine-jar': {
      alt: 'An elderly woman sits on a stone ledge and smells an empty clay jar in a sunlit courtyard.'
    },
    'rivers-and-the-sea': {
      alt: 'Two expressive freshwater streams meet a broad blue-green sea, where three face-like currents mingle beside a rocky shore.'
    },
    'the-trees-and-the-axe': {
      alt: 'A large oak and a tall evergreen stand among felled trunks and stumps, with an axe lying in the forest foreground.'
    },
    'seaside-travelers': {
      alt: 'Three travelers inspect a large tied bundle of sticks on a sandy beach beside a calm sea and rocky cliffs.'
    },
    'mercury-and-the-sculptor': {
      alt: 'A sculptor gestures to three marble statues while a plainly dressed visitor faces them in a sunlit workshop.'
    },
    'oak-and-the-reeds': {
      alt: 'A large uprooted oak lies beside a stream among tall reeds that remain rooted and bend in the passing wind.'
    },
    'the-lamp': {
      alt: 'A man leans over a bronze oil lamp to relight its small flame with a taper beside a sunlit courtyard opening.'
    },
    'crow-and-the-pitcher': {
      alt: 'A crow holds a small stone over an open terracotta pitcher, with water and several pebbles visible inside.'
    },
    'fox-and-the-grapes': {
      alt: 'A hungry red fox leaps beneath ripe purple grapes hanging high from a trellis in a sunlit Greek vineyard.'
    },
    'peacock-and-juno': {
      alt: 'Juno gestures toward a peacock’s brilliant fan of feathers as a nightingale sings from a nearby branch.'
    },
    'lark-and-her-young-ones': {
      alt: 'A mother lark guides her young away from a wheat-field nest as the farmer begins the harvest himself.'
    },
    'town-mouse-and-country-mouse': {
      alt: 'A country mouse hurries from a lavish dining table as a large human shadow passes across the room.'
    },
    'man-and-the-satyr': {
      alt: 'A puzzled satyr watches a man blow on cold hands beside a bowl of hot food in a Greek home.'
    },
    'the-two-bags': {
      alt: 'A Greek traveler carries one woven bag in front and another partly hidden behind their back.'
    },
    'travelers-and-the-plane-tree': {
      alt: 'Two tired travelers rest beneath a broad plane tree while one gestures toward its fruitless branches.'
    },
    'gnat-and-the-bull': {
      alt: 'A tiny gnat perches on a calm bull’s horn before flying away across a sunlit meadow.'
    },
    'crab-and-its-mother': {
      alt: 'A mother crab tries to walk straight along the shore while her young crab watches closely.'
    },
    'two-pots': {
      alt: 'A fragile clay pot floats downstream beside a sturdy brass pot, with a clear space between them.'
    },
    'traveler-and-his-dog': {
      alt: 'A travel-ready dog waits beside a packed doorway while its traveler points impatiently toward the road.'
    },
    'kingdom-of-the-lion': {
      alt: 'A gentle lion leads a peaceful gathering as a cautious hare stays near the edge of the animal circle.'
    },
    'the-fox-and-the-mask': {
      alt: 'A curious red fox touches a handsome actor’s mask among costumes and props in a Greek theater room.'
    },
    'peasant-and-the-eagle': {
      alt: 'An eagle tugs a peasant’s headscarf, drawing him safely away from a crumbling stone wall.'
    },
    'crow-and-the-raven': {
      alt: 'A crow caws from a roadside tree as travelers pass, while a raven watches from a nearby branch.'
    },
    'fox-and-the-woodcutter': {
      alt: 'A fox hides behind firewood as a woodcutter gestures toward its hiding place to a passing huntsman.'
    },
    'traveler-and-fortune': {
      alt: 'Dame Fortune gently wakes a tired traveler resting too close to the edge of a deep stone well.'
    },
    'wolf-and-the-housedog': {
      alt: 'A free wolf studies the collar and tether of a well-fed mastiff, then turns toward the open hills.'
    },
    'hen-and-the-swallow': {
      alt: 'A swallow warns a hen beside a nest where tiny vipers have emerged, before any attack takes place.'
    },
    'ass-and-his-purchaser': {
      alt: 'A new donkey joins the laziest animal at a straw-filled trough as its buyer looks on.'
    },
    'the-fishermen': {
      alt: 'An old fisherman speaks calmly beside two disappointed companions as their net comes ashore holding sand, stones, and a few fish.'
    },
    'mice-in-council': {
      alt: 'Mice gather around a tiny bell to plan a warning about a cat, but none volunteers to fasten it on.'
    },
    'how-the-moon-became-beautiful': {
      alt: 'Tseh-N’io stands among moonlit blossoms as the Moon brightens above and spreads gentle light across the night sky.'
    },
    'the-fox-and-the-tiger': {
      alt: 'A fox walks proudly ahead of a tiger along a forest path as nearby animals flee from the tiger behind him.'
    },
    'the-fox-and-the-raven': {
      alt: 'A fox flatters a raven on a branch as the raven opens its beak and a piece of food falls toward the waiting fox.'
    },
    'the-spirit-of-the-wu-lian-mountain': {
      alt: 'A golden-armored temple guardian confronts a mountain spirit as a priest helps a scholar climb down safely from a tower.'
    },
    'the-little-hunting-dog': {
      alt: 'A scholar welcomes a tiny hunting dog left behind after miniature knights and falcons clear insects from his room.'
    },
    'the-miserly-farmer': {
      alt: 'A monk shares pears beside a sudden fruit tree while the farmer watches from his cart in an East Asian village.'
    },
    'the-wind-the-clouds-and-the-snow': {
      alt: 'The Sun shines as a gentle judge while Snow acknowledges help from the Wind and Clouds above a winter mountain.'
    },
    'the-fish-and-the-flowers': {
      alt: 'Narcissus blossoms scent a warm fish house as carp complain beneath the flowers’ reflection.'
    }
  };

  // Choose a random illustrated tale for the homepage hero.
  // sessionStorage prevents the same image appearing on consecutive refreshes in this tab.
  function rotateHeroArtwork() {
    const hero = document.querySelector('.hero-main-art');
    if (!hero) return;
    const illustrated = stories.filter((story) => artwork[story.id]);
    if (!illustrated.length) return;
    let previous = '';
    try { previous = sessionStorage.getItem('taleatlas-last-hero') || ''; } catch (_) {}
    const choices = illustrated.length > 1
      ? illustrated.filter((story) => story.id !== previous)
      : illustrated;
    const selected = choices[Math.floor(Math.random() * choices.length)];
    hero.src = `assets/${selected.id}.webp`;
    hero.alt = artwork[selected.id].alt;
    try { sessionStorage.setItem('taleatlas-last-hero', selected.id); } catch (_) {}
  }

  let current = -1;
  let contentsPage = 0;
  const contentsPageSize = 20;
  let returnFocus = null;
  let turnTimer;
  let metadataFilters = { region: '', country: '', theme: '' };
  const storiesPerPage = 20;
  let collectionPage = 1;

  function scrollTo(element) {
    element.scrollIntoView({
      behavior: reduceMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  function openReader(index = -1) {
    returnFocus = document.activeElement;
    $('welcome').classList.add('hidden');
    $('reader').classList.remove('hidden');
    current = index;
    render(false);
    scrollTo($('reader'));
    $('reader-title').focus({ preventScroll: true });
  }

  function closeReader({ restoreFocus = true } = {}) {
    if ($('reader').classList.contains('hidden')) return;
    $('reader').classList.add('hidden');
    $('welcome').classList.remove('hidden');
    const target = returnFocus && returnFocus.isConnected ? returnFocus : $('brand-home');
    returnFocus = null;
    if (restoreFocus) {
      target.focus({ preventScroll: true });
      scrollTo(target);
    }
  }

  function artworkMarkup(story, className) {
    const image = artwork[story.id];
    if (!image) return '';
    return `<figure class="${className}">
      <img src="assets/${esc(story.id)}.webp" alt="${esc(image.alt)}" width="1600" height="1067" loading="lazy" decoding="async">
    </figure>`;
  }

  function renderContents() {
    $('reader-title').textContent = 'Contents';
    $('left-page').innerHTML = `
      <div class="page-label">Welcome, reader</div>
      <h2 class="page-title">A world inside these pages</h2>
      <div class="page-text">
        <p>Every tale is a little doorway into another place and time. Meet clever animals, brave companions, and people who learn something important along the way.</p>
        <p>Choose a story from the contents, or turn the page to begin your journey.</p>
      </div>
      <span class="folio">i</span>`;

    const contentsStart = contentsPage * contentsPageSize;
    const contentsEnd = Math.min(contentsStart + contentsPageSize, stories.length);
    const pageStories = stories.slice(contentsStart, contentsEnd);
    $('right-page').innerHTML = `
      <div class="page-label">In this book</div>
      <h2 class="page-title">Contents</h2>
      <ol class="contents-list">${pageStories.map((story, offset) => {
        const index = contentsStart + offset;
        return `
        <li><button type="button" data-story="${index}">${esc(story.title)}<small>${esc(story.country)} · ${esc(story.readingTime)}</small></button></li>`;
      }).join('')}
      </ol>
      <span class="folio">ii</span>`;

    $('right-page').querySelectorAll('[data-story]').forEach((button) => {
      button.addEventListener('click', () => go(Number(button.dataset.story)));
    });
    $('page-counter').textContent = `Contents ${contentsStart + 1}–${contentsEnd} of ${stories.length}`;
    $('prev').disabled = contentsPage === 0;
    $('prev').textContent = 'Previous';
    $('next').disabled = !stories.length;
    $('next').textContent = contentsEnd < stories.length ? 'Next' : 'Begin reading';
  }

  function renderStory() {
    const story = stories[current];
    const country = countryName(story.country);
    const countryDetails = story.country.slice(country.length);
    $('reader-title').textContent = story.title;
    $('left-page').innerHTML = `
      <div class="page-label reader-metadata">
        <button class="reader-metadata-filter" type="button" data-filter="region" data-value="${esc(story.region)}" aria-label="Filter by region: ${esc(story.region)}" aria-pressed="${metadataFilters.region === story.region}">${esc(story.region)}</button>
        <span aria-hidden="true">·</span>
        <button class="reader-metadata-filter" type="button" data-filter="theme" data-value="${esc(story.theme)}" aria-label="Filter by theme: ${esc(story.theme)}" aria-pressed="${metadataFilters.theme === story.theme}">${esc(story.theme)}</button>
      </div>
      <h2 class="page-title">${esc(story.title)}</h2>
      <p class="page-meta"><button class="reader-metadata-filter" type="button" data-filter="country" data-value="${esc(country)}" aria-label="Filter by country: ${esc(country)}" aria-pressed="${metadataFilters.country === country}">${esc(country)}</button>${esc(countryDetails)} · ${esc(story.readingTime)} read</p>
      <div class="page-text"><p>${esc(story.leftPage)}</p></div>
      <span class="folio">${String(current * 2 + 1).padStart(2, '0')}</span>`;

    $('left-page').querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const { filter, value } = button.dataset;
        closeReader({ restoreFocus: false });
        updateMetadataFilter(filter, value);
        scrollTo($('collection-title'));
        $('collection-title').focus({ preventScroll: true });
      });
    });

    $('right-page').innerHTML = `
      <div class="page-label">The tale continues</div>
      <div class="page-text"><p>${esc(story.rightPage)}</p></div>
      ${artworkMarkup(story, 'page-artwork')}
      <div class="lesson"><strong>A thought to keep</strong><p>${esc(story.moral)}</p></div>
      <span class="folio">${String(current * 2 + 2).padStart(2, '0')}</span>`;

    $('page-counter').textContent = `Story ${current + 1} of ${stories.length}`;
    $('prev').disabled = false;
    $('next').disabled = false;
    $('next').textContent = current === stories.length - 1 ? 'Back to contents' : 'Next story';
  }

  function render(animate = true) {
    const pageTurn = $('page-turn');
    if (turnTimer) window.clearTimeout(turnTimer);
    pageTurn.classList.remove('turning');
    if (animate && !reduceMotion()) {
      void pageTurn.offsetWidth;
      pageTurn.classList.add('turning');
      turnTimer = window.setTimeout(() => pageTurn.classList.remove('turning'), 640);
    }
    if (current < 0) renderContents();
    else renderStory();
  }

  function go(index) {
    if (!Number.isInteger(index) || index < 0 || index >= stories.length) return;
    current = index;
    render(true);
    scrollTo($('reader'));
    $('reader-title').focus({ preventScroll: true });
  }

  function nextPage() {
    if (current < 0 && (contentsPage + 1) * contentsPageSize < stories.length) contentsPage += 1;
    else if (current < 0) current = 0;
    else if (current >= stories.length - 1) current = -1;
    else current += 1;
    render(true);
  }

  function previousPage() {
    if (current < 0 && contentsPage > 0) contentsPage -= 1;
    else if (current <= 0) current = -1;
    else current -= 1;
    render(true);
  }

  function matchesRegion(story, region) {
    if (region === 'all') return true;
    const place = `${story.region} ${story.country}`;
    return story.region === region;
  }

  function countryName(country) {
    return country.split(';', 1)[0].trim();
  }

  function updateMetadataFilter(type, value) {
    metadataFilters[type] = value;
    collectionPage = 1;
    renderCards();
  }

  function renderCards() {
    const total = stories.length;
    const heroCount = $('hero-story-count');
    if (heroCount) heroCount.textContent = `${total} stories`;
    document.querySelectorAll('[data-region-count]').forEach((count) => {
      const regionName = count.dataset.regionCount;
      const amount = stories.filter((story) => story.region === regionName).length;
      count.textContent = `${amount} stories`;
    });
    const query = $('search').value.trim().toLowerCase();
    const region = $('region-filter').value;
    const filtered = stories.map((story, index) => ({ ...story, index })).filter((story) => {
      const searchable = `${story.title} ${story.region} ${story.country} ${story.theme} ${story.summary}`.toLowerCase();
      return searchable.includes(query)
        && matchesRegion(story, region)
        && Object.entries(metadataFilters).every(([type, value]) => {
          if (!value) return true;
          return (type === 'country' ? countryName(story.country) : story[type]) === value;
        });
    });

    const activeFilterLabels = [];
    if (query) activeFilterLabels.push(`Search: “${$('search').value.trim()}”`);
    if (region !== 'all') activeFilterLabels.push(`Browse by region: ${region}`);
    Object.entries(metadataFilters).forEach(([type, value]) => {
      if (value) activeFilterLabels.push(`${type[0].toUpperCase()}${type.slice(1)}: ${value}`);
    });
    const activeFilters = activeFilterLabels.length > 0;
    const pageCount = Math.max(1, Math.ceil(filtered.length / storiesPerPage));
    collectionPage = Math.min(collectionPage, pageCount);
    const pageStart = (collectionPage - 1) * storiesPerPage;
    const visibleStories = filtered.slice(pageStart, pageStart + storiesPerPage);
    $('story-count').textContent = activeFilters
      ? `${filtered.length} of ${stories.length} stories`
      : `${stories.length} stories`;
    $('hero-story-count').textContent = `${stories.length} stories`;
    $('active-filters').hidden = !activeFilters;
    $('active-filter-text').textContent = activeFilters ? `Filtered by ${activeFilterLabels.join(' · ')}.` : '';

    $('story-grid').innerHTML = filtered.length
      ? visibleStories.map((story) => {
        const image = artwork[story.id];
        const country = countryName(story.country);
        return `<article class="story-card${image ? ' story-card--illustrated' : ''}">
          ${artworkMarkup(story, 'story-art')}
          <div class="story-copy">
            <div class="story-tags">
              <button class="story-region metadata-filter" type="button" data-filter="region" data-value="${esc(story.region)}" aria-label="Filter by region: ${esc(story.region)}" aria-pressed="${metadataFilters.region === story.region}">${esc(story.region)}</button>
              <button class="story-country metadata-filter" type="button" data-filter="country" data-value="${esc(country)}" aria-label="Filter by country: ${esc(country)}" aria-pressed="${metadataFilters.country === country}">${esc(country)}</button>
            </div>
            <h3 id="story-title-${story.index}">${esc(story.title)}</h3>
            <p class="story-summary">${esc(story.summary)}</p>
            <div class="card-bottom">
              <button class="metadata-filter metadata-filter--theme" type="button" data-filter="theme" data-value="${esc(story.theme)}" aria-label="Filter by theme: ${esc(story.theme)}" aria-pressed="${metadataFilters.theme === story.theme}">${esc(story.theme)}</button>
              <button class="read-link" type="button" data-read="${story.index}" aria-labelledby="read-label-${story.index} story-title-${story.index}"><span id="read-label-${story.index}">Read story</span></button>
            </div>
          </div>
        </article>`;
      }).join('')
      : '<p class="empty" role="status">No stories found. Try a different search or choose another region.</p>';

    const pagination = $('collection-pagination');
    pagination.hidden = filtered.length <= storiesPerPage;
    $('collection-page-status').textContent = `Page ${collectionPage} of ${pageCount} · Showing ${pageStart + 1}–${Math.min(pageStart + storiesPerPage, filtered.length)} of ${filtered.length}`;
    $('collection-prev').disabled = collectionPage === 1;
    $('collection-next').disabled = collectionPage === pageCount;

    $('story-grid').querySelectorAll('[data-read]').forEach((button) => {
      button.addEventListener('click', () => openReader(Number(button.dataset.read)));
    });
    $('story-grid').querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const { filter, value } = button.dataset;
        updateMetadataFilter(filter, metadataFilters[filter] === value ? '' : value);
        const focusTarget = [...$('story-grid').querySelectorAll('[data-filter]')]
          .find((candidate) => candidate.dataset.filter === filter && candidate.dataset.value === value);
        focusTarget?.focus();
      });
    });
  }

  $('open-book').addEventListener('click', () => openReader());
  let dailyStoryIndex = -1;
  function setStoryOfTheDay() {
    const illustratedStories = stories.map((story, index) => ({ story, index })).filter(({ story }) => artwork[story.id]);
    if (!illustratedStories.length) return;
    const now = new Date();
    const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const chosen = illustratedStories[((dayNumber % illustratedStories.length) + illustratedStories.length) % illustratedStories.length];
    dailyStoryIndex = chosen.index;
    const story = chosen.story;
    const image = document.querySelector('.featured-art img');
    if (image) { image.src = 'assets/' + story.id + '.webp'; image.alt = artwork[story.id].alt; }
    $('featured-origin').textContent = 'FROM ' + story.country.toUpperCase() + ' · ' + story.region.toUpperCase();
    $('featured-title').textContent = story.title;
    $('featured-summary').textContent = story.summary;
  }
  $('read-featured')?.addEventListener('click', () => {
    if (dailyStoryIndex >= 0) openReader(dailyStoryIndex);
  });
  document.querySelectorAll('#region-index [data-region]').forEach((button) => {
    button.addEventListener('click', () => {
      $('region-filter').value = button.dataset.region;
      renderCards();
      scrollTo($('collection-title'));
    });
  });
  $('search-top')?.addEventListener('click', () => { scrollTo($('search')); $('search').focus({ preventScroll: true }); });
  $('close-book').addEventListener('click', () => closeReader());
  $('brand-home').addEventListener('click', (event) => {
    event.preventDefault();
    closeReader({ restoreFocus: false });
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    $('brand-home').focus({ preventScroll: true });
  });
  $('about-button').addEventListener('click', () => $('about-dialog').showModal());
  $('about-close').addEventListener('click', () => $('about-dialog').close());
  $('about-dialog').addEventListener('close', () => $('about-button').focus({ preventScroll: true }));
  $('about-dialog').addEventListener('click', (event) => {
    if (event.target === $('about-dialog')) $('about-dialog').close();
  });
  $('prev').addEventListener('click', previousPage);
  $('next').addEventListener('click', nextPage);
  $('search').addEventListener('input', () => { collectionPage = 1; renderCards(); });
  $('region-filter').addEventListener('change', () => { collectionPage = 1; renderCards(); });
  $('collection-prev').addEventListener('click', () => {
    if (collectionPage > 1) { collectionPage -= 1; renderCards(); scrollTo($('collection-title')); }
  });
  $('collection-next').addEventListener('click', () => {
    collectionPage += 1; renderCards(); scrollTo($('collection-title'));
  });
  $('clear-filters').addEventListener('click', () => {
    $('search').value = '';
    $('region-filter').value = 'all';
    metadataFilters = { region: '', country: '', theme: '' };
    collectionPage = 1;
    renderCards();
    $('search').focus();
  });

  document.addEventListener('keydown', (event) => {
    if ($('reader').classList.contains('hidden') || $('about-dialog').open) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select, [role="textbox"]'))) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextPage();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousPage();
    } else if (event.key === 'Escape') {
      closeReader();
    }
  });

  rotateHeroArtwork();
  setStoryOfTheDay();
  renderCards();
})();
