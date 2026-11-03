(() => {
  const content = `
  env:
  # Kafka Topics
  - name: SOME_KAFKA_TOPIC
    value: actual_topic_name
  - name: XX
    value: 1
`

  const r = new RegExp(`name:\\s*SOME_KAFKA_TOPIC\\s*value:\\s*(\\w+)`)
  const result = content.match(r)
  console.log(result)
  console.log(result?.[1])
})()
