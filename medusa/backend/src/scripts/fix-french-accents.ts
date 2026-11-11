import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Batch-fix missing French accents in content generated without accents
 * (products, collections, blog posts). Uses word-boundary regex to
 * avoid breaking words that contain the pattern as substring.
 */

// [pattern, replacement] — word-boundary based, case preserved via duplicates
const REPLACEMENTS: Array<[RegExp, string]> = [
  // bebe / bebes / Bebe / Bebes
  [/\bbebe\b/g, "bébé"],
  [/\bBebe\b/g, "Bébé"],
  [/\bbebes\b/g, "bébés"],
  [/\bBebes\b/g, "Bébés"],
  [/\bBEBE\b/g, "BÉBÉ"],
  [/\bBEBES\b/g, "BÉBÉS"],

  // tete / tetee / tetees
  [/\btete\b/g, "tête"],
  [/\btetes\b/g, "têtes"],
  [/\bTete\b/g, "Tête"],
  [/\btetee\b/g, "tétée"],
  [/\btetees\b/g, "tétées"],

  // certifie
  [/\bcertifie\b/g, "certifié"],
  [/\bCertifie\b/g, "Certifié"],
  [/\bcertifies\b/g, "certifiés"],
  [/\bcertifiee\b/g, "certifiée"],
  [/\bCertifiee\b/g, "Certifiée"],
  [/\bcertifiees\b/g, "certifiées"],

  // reduction / reduit
  [/\breduction\b/g, "réduction"],
  [/\bReduction\b/g, "Réduction"],
  [/\breduit\b/g, "réduit"],
  [/\bReduit\b/g, "Réduit"],
  [/\breduite\b/g, "réduite"],
  [/\breduits\b/g, "réduits"],
  [/\breduites\b/g, "réduites"],

  // ajuste / ajustable
  [/\bajuste\b/g, "ajusté"],
  [/\bajustee\b/g, "ajustée"],
  [/\bajustes\b/g, "ajustés"],
  [/\breglage\b/g, "réglage"],
  [/\breglages\b/g, "réglages"],
  [/\breglable\b/g, "réglable"],
  [/\breglables\b/g, "réglables"],
  [/\bRegle\b/g, "Règle"],
  [/\bregle\b/g, "règle"],
  [/\bregles\b/g, "règles"],

  // apres
  [/\bapres\b/g, "après"],
  [/\bApres\b/g, "Après"],

  // efficacite
  [/\befficacite\b/g, "efficacité"],
  [/\bEfficacite\b/g, "Efficacité"],

  // recommande
  [/\brecommande\b/g, "recommandé"],
  [/\bRecommande\b/g, "Recommandé"],
  [/\brecommandee\b/g, "recommandée"],
  [/\brecommandes\b/g, "recommandés"],
  [/\brecommandees\b/g, "recommandées"],
  [/\brecommandation\b/g, "recommandation"],
  [/\brecommandations\b/g, "recommandations"],

  // protege
  [/\bprotege\b/g, "protège"],
  [/\bProtege\b/g, "Protège"],
  [/\bproteges\b/g, "protèges"],

  // verifier
  [/\bverifier\b/g, "vérifier"],
  [/\bverifie\b/g, "vérifié"],
  [/\bverifiee\b/g, "vérifiée"],
  [/\bverifiez\b/g, "vérifiez"],

  // securite
  [/\bsecurite\b/g, "sécurité"],
  [/\bSecurite\b/g, "Sécurité"],
  [/\bsecurise\b/g, "sécurisé"],
  [/\bsecurisee\b/g, "sécurisée"],
  [/\bsecurises\b/g, "sécurisés"],

  // evenement
  [/\bevenement\b/g, "événement"],
  [/\bEvenement\b/g, "Événement"],
  [/\bevenements\b/g, "événements"],

  // age (careful: exclude "page", "gage" etc via word boundary)
  [/\bage\b/g, "âge"],
  [/\bages\b/g, "âges"],
  [/\bAge\b/g, "Âge"],

  // experience
  [/\bexperience\b/g, "expérience"],
  [/\bExperience\b/g, "Expérience"],
  [/\bexperiences\b/g, "expériences"],

  // temoign
  [/\btemoignage\b/g, "témoignage"],
  [/\btemoignages\b/g, "témoignages"],
  [/\btemoigne\b/g, "témoigne"],
  [/\btemoignent\b/g, "témoignent"],
  [/\btemoin\b/g, "témoin"],

  // ecoute / ecouter
  [/\becoute\b/g, "écoute"],
  [/\becouter\b/g, "écouter"],

  // matiere
  [/\bmatiere\b/g, "matière"],
  [/\bmatieres\b/g, "matières"],

  // utilise
  [/\butilise\b/g, "utilisé"],
  [/\butilisee\b/g, "utilisée"],
  [/\butilises\b/g, "utilisés"],
  [/\butilisees\b/g, "utilisées"],
  [/\butilisation\b/g, "utilisation"],

  // sante / ideal
  [/\bsante\b/g, "santé"],
  [/\bSante\b/g, "Santé"],
  [/\bideal\b/g, "idéal"],
  [/\bIdeal\b/g, "Idéal"],
  [/\bideale\b/g, "idéale"],
  [/\bideales\b/g, "idéales"],
  [/\bidealement\b/g, "idéalement"],
  [/\bIdealement\b/g, "Idéalement"],

  // meme / memes (careful: memoire, mementos)
  [/\bmeme\b/g, "même"],
  [/\bMeme\b/g, "Même"],
  [/\bmemes\b/g, "mêmes"],

  // fete / fetes
  [/\bfete\b/g, "fête"],
  [/\bFete\b/g, "Fête"],
  [/\bfetes\b/g, "fêtes"],

  // pediatre
  [/\bpediatre\b/g, "pédiatre"],
  [/\bpediatres\b/g, "pédiatres"],

  // specialiste
  [/\bspecialiste\b/g, "spécialiste"],
  [/\bspecialistes\b/g, "spécialistes"],
  [/\bspecialise\b/g, "spécialisé"],
  [/\bspecialisee\b/g, "spécialisée"],
  [/\bspecialement\b/g, "spécialement"],
  [/\bSpecialement\b/g, "Spécialement"],

  // qualite
  [/\bqualite\b/g, "qualité"],
  [/\bQualite\b/g, "Qualité"],

  // serenite
  [/\bserenite\b/g, "sérénité"],
  [/\bSerenite\b/g, "Sérénité"],

  // ne / nes (past participle)
  [/\bnes\b/g, "nés"],
  [/\bNes\b/g, "Nés"],

  // developpe
  [/\bdeveloppe\b/g, "développé"],
  [/\bdeveloppement\b/g, "développement"],
  [/\bdevelopper\b/g, "développer"],

  // europeenne / europeen
  [/\beuropeenne\b/g, "européenne"],
  [/\beuropeen\b/g, "européen"],
  [/\beuropeennes\b/g, "européennes"],
  [/\beuropeens\b/g, "européens"],

  // systeme
  [/\bsysteme\b/g, "système"],
  [/\bSysteme\b/g, "Système"],
  [/\bsystemes\b/g, "systèmes"],
  [/\bsystematique\b/g, "systématique"],

  // regulier
  [/\bregulier\b/g, "régulier"],
  [/\breguliere\b/g, "régulière"],
  [/\bregulierement\b/g, "régulièrement"],

  // cote / cotes (careful: "cotes" pronounced same exists meaning ribs)
  [/\bcote\b/g, "côté"],
  [/\bCote\b/g, "Côté"],

  // degre
  [/\bdegre\b/g, "degré"],
  [/\bdegres\b/g, "degrés"],

  // modere
  [/\bmodere\b/g, "modéré"],
  [/\bmoderee\b/g, "modérée"],

  // serie
  [/\bserie\b/g, "série"],
  [/\bseries\b/g, "séries"],
  [/\bSerie\b/g, "Série"],

  // generalement / general
  [/\bgeneralement\b/g, "généralement"],
  [/\bGeneralement\b/g, "Généralement"],
  [/\bgeneral\b/g, "général"],
  [/\bgenerale\b/g, "générale"],
  [/\bGeneral\b/g, "Général"],

  // necessaire
  [/\bnecessaire\b/g, "nécessaire"],
  [/\bNecessaire\b/g, "Nécessaire"],
  [/\bnecessaires\b/g, "nécessaires"],
  [/\bnecessite\b/g, "nécessité"],
  [/\bnecessites\b/g, "nécessités"],

  // enorme
  [/\benorme\b/g, "énorme"],
  [/\benormement\b/g, "énormément"],

  // elegant
  [/\belegant\b/g, "élégant"],
  [/\belegante\b/g, "élégante"],
  [/\belegance\b/g, "élégance"],

  // caracteristique
  [/\bcaracteristique\b/g, "caractéristique"],
  [/\bCaracteristique\b/g, "Caractéristique"],
  [/\bcaracteristiques\b/g, "caractéristiques"],
  [/\bCaracteristiques\b/g, "Caractéristiques"],

  // pres (careful: "prescription", "presque")
  [/\bpres\b/g, "près"],

  // energie
  [/\benergie\b/g, "énergie"],
  [/\benergies\b/g, "énergies"],

  // equilibre
  [/\bequilibre\b/g, "équilibre"],
  [/\bequilibres\b/g, "équilibres"],

  // equivalent
  [/\bequivalent\b/g, "équivalent"],
  [/\bEquivalent\b/g, "Équivalent"],

  // evident
  [/\bevident\b/g, "évident"],
  [/\bevidente\b/g, "évidente"],
  [/\bevidence\b/g, "évidence"],
  [/\bevidemment\b/g, "évidemment"],

  // ete (summer, or past participle "etre")
  [/\bete\b/g, "été"],
  [/\bEte\b/g, "Été"],

  // supermarche
  [/\bsupermarche\b/g, "supermarché"],
  [/\bsupermarches\b/g, "supermarchés"],

  // concue / concus
  [/\bconcu\b/g, "conçu"],
  [/\bconcue\b/g, "conçue"],
  [/\bconcus\b/g, "conçus"],
  [/\bconcues\b/g, "conçues"],
  [/\bConcu\b/g, "Conçu"],

  // ne "il n'y a"
  [/\bn a\b/g, "n'a"],

  // preparation
  [/\bpreparer\b/g, "préparer"],
  [/\bprepare\b/g, "préparé"],
  [/\bpreparation\b/g, "préparation"],

  // plusieurs annees etc
  [/\bannee\b/g, "année"],
  [/\bannees\b/g, "années"],
  [/\bAnnee\b/g, "Année"],

  // premier/premiere
  [/\bpremiere\b/g, "première"],
  [/\bpremieres\b/g, "premières"],
  [/\bPremiere\b/g, "Première"],

  // derniere
  [/\bderniere\b/g, "dernière"],
  [/\bdernieres\b/g, "dernières"],

  // poupee / poupees
  [/\bpoupee\b/g, "poupée"],
  [/\bpoupees\b/g, "poupées"],

  // arete
  [/\barete\b/g, "arrête"],

  // plebicite
  [/\bplebicite\b/g, "plébicité"],
  [/\bplebiscite\b/g, "plébiscité"],
  [/\bplebiscitee\b/g, "plébiscitée"],

  // synthetise
  [/\bsynthetise\b/g, "synthétisé"],
  [/\bsynthetisee\b/g, "synthétisée"],

  // apprecie
  [/\bapprecie\b/g, "apprécié"],
  [/\bappreciee\b/g, "appréciée"],
  [/\bapprecies\b/g, "appréciés"],
  [/\bappreciees\b/g, "appréciées"],
  [/\bApprecie\b/g, "Apprécié"],

  // fabrique / fabriquer
  [/\bfabrique\b/g, "fabriqué"],
  [/\bfabriquee\b/g, "fabriquée"],
  [/\bfabriques\b/g, "fabriqués"],
  [/\bfabriquees\b/g, "fabriquées"],

  // cree
  [/\bcree\b/g, "créé"],
  [/\bcreer\b/g, "créer"],

  // complet / complete
  [/\bcomplet\b/g, "complet"], // OK
  [/\bcompletement\b/g, "complètement"],
  [/\bCompletement\b/g, "Complètement"],

  // mere / meres
  [/\bmere\b/g, "mère"],
  [/\bmeres\b/g, "mères"],

  // pere / peres
  [/\bpere\b/g, "père"],
  [/\bperes\b/g, "pères"],

  // frere
  [/\bfrere\b/g, "frère"],

  // soeur already has special char; use "soeur"
  [/\bsoeur\b/g, "sœur"],
  [/\bsoeurs\b/g, "sœurs"],

  // couture
  [/\bcouteuse\b/g, "coûteuse"],
  [/\bcouteux\b/g, "coûteux"],

  // etoile
  [/\betoile\b/g, "étoile"],
  [/\betoiles\b/g, "étoiles"],
  [/\bEtoile\b/g, "Étoile"],

  // moyen
  [/\bmoyen\b/g, "moyen"], // OK

  // chaque
  [/\bchaque\b/g, "chaque"], // OK

  // tres
  [/\btres\b/g, "très"],
  [/\bTres\b/g, "Très"],

  // jusqua → jusqu'à
  [/\bjusqua\b/g, "jusqu'à"],
  [/\bjusqu a\b/g, "jusqu'à"],

  // n importe, d'autres etc.
  [/\bn importe\b/g, "n'importe"],
  [/\bd autres\b/g, "d'autres"],
  [/\bl audition\b/g, "l'audition"],
  [/\bl enfant\b/g, "l'enfant"],
  [/\bl ecole\b/g, "l'école"],
  [/\bl oreille\b/g, "l'oreille"],
  [/\bl utilisation\b/g, "l'utilisation"],
  [/\bqu il\b/g, "qu'il"],
  [/\bqu elle\b/g, "qu'elle"],
  [/\bqu un\b/g, "qu'un"],
  [/\bqu une\b/g, "qu'une"],
  [/\bs adapter\b/g, "s'adapter"],
  [/\bc est\b/g, "c'est"],
  [/\bC est\b/g, "C'est"],
  [/\bd artifice\b/g, "d'artifice"],
  [/\baudition\b/g, "audition"], // OK
  [/\bs agripp\b/g, "s'agripp"],
  [/\bautour de\b/g, "autour de"],  // OK

  // audition related
  [/\bauditive\b/g, "auditive"], // OK, vérifie
  [/\bAuditive\b/g, "Auditive"],
  [/\bauditif\b/g, "auditif"],

  // prefere
  [/\bprefere\b/g, "préféré"],
  [/\bpreferer\b/g, "préférer"],
  [/\bpreferee\b/g, "préférée"],
  [/\bPreferez\b/g, "Préférez"],
  [/\bpreferez\b/g, "préférez"],

  // detail
  [/\bdetail\b/g, "détail"],
  [/\bdetails\b/g, "détails"],

  // tetine
  [/\btetine\b/g, "tétine"],
  [/\btetines\b/g, "tétines"],

  // perine
  [/\bperinee\b/g, "périnée"],
  [/\bPerinee\b/g, "Périnée"],

  // decouvrez
  [/\bdecouvrez\b/g, "découvrez"],
  [/\bDecouvrez\b/g, "Découvrez"],
  [/\bdecouvrir\b/g, "découvrir"],
  [/\bdecouvre\b/g, "découvre"],

  // reference
  [/\breference\b/g, "référence"],
  [/\bReference\b/g, "Référence"],
  [/\breferences\b/g, "références"],

  // prefere
  [/\bpreferez\b/g, "préférez"],

  // a traiter
  [/\bdepuis\b/g, "depuis"], // OK

  // procede
  [/\bprocede\b/g, "procédé"],
  [/\bprocedure\b/g, "procédure"],

  // problem
  [/\bprobleme\b/g, "problème"],
  [/\bProbleme\b/g, "Problème"],
  [/\bproblemes\b/g, "problèmes"],

  // present
  [/\bpresent\b/g, "présent"],
  [/\bpresente\b/g, "présente"],
  [/\bpresence\b/g, "présence"],

  // peche
  [/\bpeche\b/g, "pêche"],

  // plusieurs
  [/\bplusieurs\b/g, "plusieurs"], // OK

  // regulier
  [/\bregulierement\b/g, "régulièrement"],

  // independant
  [/\bindependant\b/g, "indépendant"],
  [/\bindependance\b/g, "indépendance"],
  [/\bindependants\b/g, "indépendants"],
  [/\bindependante\b/g, "indépendante"],

  // special words related to the products
  [/\bdepart\b/g, "départ"],

  // rangement
  [/\brangement\b/g, "rangement"], // OK

  // chapeau
  [/\bchapeau\b/g, "chapeau"], // OK

  // prevu
  [/\bprevu\b/g, "prévu"],
  [/\bprevue\b/g, "prévue"],
  [/\bprevus\b/g, "prévus"],
  [/\bprevues\b/g, "prévues"],
  [/\bprevoir\b/g, "prévoir"],

  // marque
  [/\bmarque\b/g, "marque"], // OK, but "marques" OK

  // materiaux
  [/\bmateriaux\b/g, "matériaux"],
  [/\bMateriaux\b/g, "Matériaux"],

  // leger
  [/\bleger\b/g, "léger"],
  [/\blegere\b/g, "légère"],
  [/\blegeres\b/g, "légères"],
  [/\blegers\b/g, "légers"],
  [/\blegerement\b/g, "légèrement"],
  [/\bLeger\b/g, "Léger"],
  [/\bLegerement\b/g, "Légèrement"],

  // ultra-leger
  [/\bultra-leger\b/g, "ultra-léger"],

  // electrique
  [/\belectrique\b/g, "électrique"],
  [/\belectriques\b/g, "électriques"],
  [/\bElectrique\b/g, "Électrique"],

  // elastique
  [/\belastique\b/g, "élastique"],
  [/\belastiques\b/g, "élastiques"],

  // attenuation / attenuer
  [/\battenuation\b/g, "atténuation"],
  [/\battenuer\b/g, "atténuer"],
  [/\battenue\b/g, "atténue"],
  [/\battenuee\b/g, "atténuée"],
  [/\battenues\b/g, "atténués"],

  // degrees
  [/\benviron 170\b/g, "environ 170"], // OK

  // completement
  [/\bcompletement\b/g, "complètement"],

  // donne
  [/\bdonne\b/g, "donné"], // risky but often right

  // evolutif
  [/\bevolutif\b/g, "évolutif"],
  [/\bevolutive\b/g, "évolutive"],
  [/\bEvolutif\b/g, "Évolutif"],

  // famille
  [/\bfamille\b/g, "famille"], // OK
  [/\bfamilles\b/g, "familles"], // OK

  // jeune
  [/\bjeune\b/g, "jeune"], // OK

  // habituel
  [/\bhabituation\b/g, "habituation"], // OK

  // particuliere
  [/\bparticuliere\b/g, "particulière"],
  [/\bparticulieres\b/g, "particulières"],
  [/\bParticulierement\b/g, "Particulièrement"],
  [/\bparticulierement\b/g, "particulièrement"],

  // favoriser
  [/\bfavoriser\b/g, "favoriser"], // OK

  // integr
  [/\bintegre\b/g, "intégré"],
  [/\bintegrer\b/g, "intégrer"],

  // attachee
  [/\battachee\b/g, "attachée"],
  [/\battaches\b/g, "attachés"],

  // tout particulier
  [/\btout particulierement\b/g, "tout particulièrement"],

  // stratege
  [/\bstrategie\b/g, "stratégie"],

  // retrieve
  [/\bretrouvez\b/g, "retrouvez"], // OK

  // specifiq
  [/\bspecifique\b/g, "spécifique"],
  [/\bspecifiques\b/g, "spécifiques"],

  // coussine / coussinets
  [/\bcoussinets\b/g, "coussinets"], // OK

  // reactiv
  [/\breactive\b/g, "réactif"], // context

  // premiere
  [/\bpremier\b/g, "premier"], // OK

  // dedie
  [/\bdedie\b/g, "dédié"],
  [/\bdediee\b/g, "dédiée"],
  [/\bdedies\b/g, "dédiés"],

  // allege
  [/\ballege\b/g, "allégé"],
  [/\ballegee\b/g, "allégée"],

  // utiliser / utilisee
  [/\butilisee\b/g, "utilisée"],

  // neonatologie
  [/\bneonatalogie\b/g, "néonatalogie"],
  [/\bneonatologie\b/g, "néonatologie"],

  // preoccupation
  [/\bpreoccupation\b/g, "préoccupation"],

  // peu à peu
  [/\bpeu a peu\b/g, "peu à peu"],
  [/\bface a\b/g, "face à"],

  // a cote
  [/\ba cote\b/g, "à côté"],
  [/\bA cote\b/g, "À côté"],

  // a partir
  [/\ba partir\b/g, "à partir"],
  [/\bA partir\b/g, "À partir"],

  // jusqu'
  [/\bjusqua\b/g, "jusqu'à"],

  // deja
  [/\bdeja\b/g, "déjà"],
  [/\bDeja\b/g, "Déjà"],

  // voila
  [/\bvoila\b/g, "voilà"],

  // la-bas
  [/\bla-bas\b/g, "là-bas"],

  // la (pronoun, accent unnecessary, skip)
  // pret / prete
  [/\bpret\b/g, "prêt"],
  [/\bprete\b/g, "prête"],
  [/\bprets\b/g, "prêts"],

  // traitement
  [/\btraite\b/g, "traité"],
  [/\btraitee\b/g, "traitée"],

  // conclusion: some done already
]

function applyAccents(text: string | null | undefined): string {
  if (!text) return text as any
  let out = String(text)
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

export default async function fixFrenchAccents({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // ---------- Products ----------
  const prods = await pg.raw(`SELECT id, title, subtitle, description, metadata FROM product WHERE deleted_at IS NULL`)
  let prodCount = 0
  for (const p of prods.rows || []) {
    const newTitle = applyAccents(p.title)
    const newSubtitle = applyAccents(p.subtitle)
    const newDesc = applyAccents(p.description)

    // Metadata: apply to string values + nested fields we care about
    const meta = p.metadata || {}
    const newMeta: any = { ...meta }
    for (const key of ["meta_title", "meta_description", "affiliate_label"]) {
      if (typeof meta[key] === "string") newMeta[key] = applyAccents(meta[key])
    }
    if (Array.isArray(meta.benefits)) newMeta.benefits = meta.benefits.map((b: string) => applyAccents(b))
    if (Array.isArray(meta.faqs)) newMeta.faqs = meta.faqs.map((f: any) => ({ q: applyAccents(f.q), a: applyAccents(f.a) }))

    const changed =
      newTitle !== p.title ||
      newSubtitle !== p.subtitle ||
      newDesc !== p.description ||
      JSON.stringify(newMeta) !== JSON.stringify(meta)

    if (changed) {
      await pg.raw(
        `UPDATE product SET title = ?, subtitle = ?, description = ?, metadata = ?::jsonb WHERE id = ?`,
        [newTitle, newSubtitle, newDesc, JSON.stringify(newMeta), p.id]
      )
      prodCount++
    }
  }
  logger.info(`  + ${prodCount} products updated`)

  // ---------- Collections ----------
  const cols = await pg.raw(`SELECT id, title, metadata FROM product_collection WHERE deleted_at IS NULL`)
  let colCount = 0
  for (const c of cols.rows || []) {
    const newTitle = applyAccents(c.title)
    const meta = c.metadata || {}
    const newMeta: any = { ...meta }
    for (const key of ["meta_title", "meta_description", "intro_text", "seo_text"]) {
      if (typeof meta[key] === "string") newMeta[key] = applyAccents(meta[key])
    }
    if (Array.isArray(meta.faqs)) newMeta.faqs = meta.faqs.map((f: any) => ({ q: applyAccents(f.q), a: applyAccents(f.a) }))

    const changed = newTitle !== c.title || JSON.stringify(newMeta) !== JSON.stringify(meta)
    if (changed) {
      await pg.raw(
        `UPDATE product_collection SET title = ?, metadata = ?::jsonb WHERE id = ?`,
        [newTitle, JSON.stringify(newMeta), c.id]
      )
      colCount++
    }
  }
  logger.info(`  + ${colCount} collections updated`)

  // ---------- Blog posts ----------
  const posts = await pg.raw(`SELECT id, title, seo_title, seo_description, content, excerpt FROM blog_post WHERE deleted_at IS NULL`)
  let postCount = 0
  for (const b of posts.rows || []) {
    const newTitle = applyAccents(b.title)
    const newSeoTitle = applyAccents(b.seo_title)
    const newSeoDesc = applyAccents(b.seo_description)
    const newContent = applyAccents(b.content)
    const newExcerpt = applyAccents(b.excerpt)
    const changed =
      newTitle !== b.title ||
      newSeoTitle !== b.seo_title ||
      newSeoDesc !== b.seo_description ||
      newContent !== b.content ||
      newExcerpt !== b.excerpt
    if (changed) {
      await pg.raw(
        `UPDATE blog_post SET title = ?, seo_title = ?, seo_description = ?, content = ?, excerpt = ? WHERE id = ?`,
        [newTitle, newSeoTitle, newSeoDesc, newContent, newExcerpt, b.id]
      )
      postCount++
    }
  }
  logger.info(`  + ${postCount} blog posts updated`)

  logger.info("Done!")
}
