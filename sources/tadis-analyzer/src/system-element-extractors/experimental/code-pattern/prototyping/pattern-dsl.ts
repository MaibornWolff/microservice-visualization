const content = `
gfd kdfgjdk @EventProcessor (
  receiveFromExchange = "source-exchange-X",
  receiveFromRoutingKey = "s.publish.update",
  receiveFromQueue = "service1.x.publish.update",
  sendToExchange = TARGET_EXCHANGE_NAME,
  sendToRoutingKey = TARGET_EXCHANGE_ROUTING_KEY,
  autoSave = false)
public Container receiveX(X x) {
}
`
const ws = '\\s*'
const anything = '[^]*'

const dslExpr = `@EventProcessor  (  [^)]*sendToExchange  =  (id)`
let re = dslExpr
re = re.replace(/\(id\)/g, ':id:')
re = re.replace(/\(/g, '\\(')
re = re.replace(/:id:/g, '(\\w+)')
re = re.replace(/\*{2}/g, anything)
re = re.replace(/ {2}/g, ws)

const r = new RegExp(re)
const result = content.match(r)
console.log(result)
console.log(result?.[1])
