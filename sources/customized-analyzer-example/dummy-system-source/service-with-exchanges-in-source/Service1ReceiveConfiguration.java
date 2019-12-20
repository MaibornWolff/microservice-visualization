package de.x.config.receive;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class Service1ReceiveConfiguration {

    public static final String EXCHANGE = "Z";

    public static final String ROUTING_KEY = "r.publish.update";

    public static final String QUEUE = "q." + ROUTING_KEY;


    @Bean
    public Queue eventPublishUpdateQueue() {
        return new Queue(QUEUE, true);
    }


    @Bean
    @Primary
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }


    @Bean
    public Binding plannedVehicleSequenceBinding(@Qualifier("eventPublishUpdateQueue") Queue queue,
                                                 @Qualifier("exchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

}
