const cheerio = require('cheerio');
const queryString = require('query-string');
const superagent = require('superagent');
const PromiseAll = require('promises-all');


function put(_id,pdata) {
    return new Promise(function(resolve, reject) {	
		superagent
			.get(`http://kdg1986.synology.me:9200/corearoadbike/frameBoard/_search?q=_id:${_id}&pretty`)
			.then( data => {				
				if( !JSON.parse(data.text).hits.max_score ){						
						superagent
						.put(`http://kdg1986.synology.me:9200/corearoadbike/frameBoard/${_id}?pretty`)
						.send(pdata)
						.set('Content-Type', 'application/json')
						.then( data => {							
							resolve(_id);
						})						
				}else{
						reject(_id);
				}
			});		
    });	
}

const running = () => {		
	//console.log('wait...');
	setTimeout(()=>{	
		//console.log('running...');
		superagent
			.get('http://corearoadbike.com/board/board.php?t_id=Menu02Top6&category=%ED%8C%90%EB%A7%A4')
			.then( data => {
				const $ = cheerio.load(data.text);				
				const obj = {};				
				$("td.list_title_B a").each(( idx,node ) => Object.assign(obj, { [queryString.parse(node.attribs.href).no] : node.attribs.title }) );								
				PromiseAll.all([...Object.keys(obj).map(key => new put(key, { title : obj[key] }) )]).then(function(response) {
					const rtnStr = response.resolve.reduce((acc,cur,idx,arr) => acc += `${obj[cur]}\n`,"");
					if( rtnStr.length > 0 ) console.log( `new item\n${rtnStr}` );
					running();
				}, function(error) {
					console.log(error);
				});
				
			});		
	},60000)
}

(()=>{
	//running();
	//return
	console.log('demon init');
	console.log('elasticsearch index check');	
	superagent
		.get(`http://kdg1986.synology.me:9200/corearoadbike`)
		.then(data => {
			console.log('index exist');
			running();
		})
		.catch(()=>{
			console.log('index not exist');			
			superagent
				.put(`http://kdg1986.synology.me:9200/corearoadbike?pretty`)
				.then(data => {
					console.log('index create');
					running();
				});
		});
})();




 





