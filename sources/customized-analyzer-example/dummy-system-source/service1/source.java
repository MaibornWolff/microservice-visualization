@Service
@Slf4j
public class EventService {

    private static final String TARGET_EXCHANGE_NAME = "target-exchange-X";

    private static final String TARGET_EXCHANGE_ROUTING_KEY = "t.publish.update";

    @Autowired
    @Qualifier("rabbitTemplateSendToDQ")
    private RabbitTemplate rabbitTemplateSendToDQ;


    @EventProcessor(
            receiveFromExchange = "source-exchange-X",
            receiveFromRoutingKey = "s.publish.update",
            receiveFromQueue = "service1.x.publish.update",
            sendToExchange = TARGET_EXCHANGE_NAME,
            sendToRoutingKey = TARGET_EXCHANGE_ROUTING_KEY,
            autoSave = false)
    public Container receiveX(X x) {
    }

    @EventProcessor(
            receiveFromExchange = "source-exchange-Y",
            receiveFromRoutingKey = "s.publish.update",
            receiveFromQueue = "service1.y.publish.update",
            sendToExchange = "target-exchange-Y",
            sendToRoutingKey = TARGET_EXCHANGE_ROUTING_KEY,
            autoSave = false)
    public Container receiveY(Y y) {
    }
}