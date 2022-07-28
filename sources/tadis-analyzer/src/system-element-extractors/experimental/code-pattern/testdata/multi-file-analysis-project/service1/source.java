import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KTable;

@Startup
@Singleton
public class SomeKafkaProducer extends AbstractKafkaProducer {

    @Inject
    @ConfigProperty(name = "FIRST_KAFKA_TOPIC")
    protected String kafkaTopic1;

    @Inject
    @ConfigProperty(name = "SECOND_KAFKA_TOPIC")
    protected String kafkaTopic2;



    final KStream<String, X>[] orderInfoStreams = streamsBuilder
            .stream(kafkaTopic1, Consumed.with(Serdes.String(), orderInfoSerde))


    final KStream<String, X>[] orderInfoStreams = streamsBuilder
            .stream(kafkaTopic2, Consumed.with(Serdes.String(), orderInfoSerde))

}
