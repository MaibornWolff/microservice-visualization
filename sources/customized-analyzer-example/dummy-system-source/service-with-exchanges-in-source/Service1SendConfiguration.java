package de.x.config.send;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Consumer;

@Configuration
public class Service1SendConfiguration {

    private static final Logger LOGGER = LoggerFactory.getLogger(Service1SendConfiguration.class);

    private static final String X_EXCHANGE = "exchangeInSource1";

    private static final String Y_EXCHANGE = "exchangeInSource2";

    private static final String ROUTING_KEY = "r.publish.update";


    @Bean
    public Consumer<Event> eventConsumer(
            @Qualifier("publishTemplate") RabbitTemplate publishTemplate) {
        return event -> {
            LOGGER.info(Payload.withLogFields(event), "Sending Event.");
            publishTemplate.convertAndSend(event);
        };
    }


    @Bean
    public Exchange trainRunExchange() {
        return new DirectExchange(EXCHANGE);
    }


    @Bean
    public RabbitTemplate publishTemplate(ConnectionFactory connectionFactory, MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        template.setExchange(EXCHANGE);
        template.setRoutingKey(ROUTING_KEY);
        return template;
    }

}
