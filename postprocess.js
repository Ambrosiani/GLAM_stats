
import { readJSON, writeJSON, writeTXT } from 'https://deno.land/x/flat/mod.ts'
import { xml2js } from 'https://deno.land/x/xml2js/mod.ts'
import { slugify } from 'https://deno.land/x/slugify/mod.ts'

// The filename is the first invocation argument
// const filename = Deno.args[0] // Same name as downloaded_filename
// const text = await readTXT(filename)
// let data = xml2js(text, { compact: true })
// await writeJSON('arkdes.json', data, null, 2)

var institutions = await readJSON('se_config.json')

var stats = []

for (const institution of institutions) {
    let url = 'https://tools.wmflabs.org//glamtools/glamorous.php?doit=1&category=' + institution.cat.replace(' ', '+') + '&use_globalusage=1&ns0=1&depth=9&projects[wikipedia]=1&projects[wikimedia]=1&projects[wikisource]=1&projects[wikibooks]=1&projects[wikiquote]=1&projects[wiktionary]=1&projects[wikinews]=1&projects[wikivoyage]=1&projects[wikispecies]=1&projects[mediawiki]=1&projects[wikidata]=1&projects[wikiversity]=1&format=xml'
    let response = await fetch(url)
    let body = await response.text()
    let data = xml2js(body, { compact: true })
    await writeTXT('data/' + slugify(institution.name, {lower: true, remove: /[$*_+~.,()'"!\-:@]/g}) + '.xml', body)
    await writeJSON('data/' + slugify(institution.name, {lower: true, remove: /[$*_+~.,()'"!\-:@]/g}) + '.json', data, null, 2)

    var percent_used = parseInt(data.results.stats._attributes.distinct_images)/parseInt(data.results._attributes.images_in_category)
    percent_used.toFixed(2)

    stats.push({
        "name":institution.name, 
        "cat": institution.cat, 
        "distinct_used": data.results.stats._attributes.distinct_images,
        "files": data.results._attributes.images_in_category,
        "percent_used": percent_used,
        "total_usage": data.results.stats._attributes.total_usage
    })
}

await writeJSON('data/stats.json', stats, null, 2)
