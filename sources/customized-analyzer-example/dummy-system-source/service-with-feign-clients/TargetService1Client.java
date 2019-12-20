package de.d.service;

import java.util.Collection;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import de.d.model.D;

@FeignClient(
        value = "target-service1",
        decode404 = true, url = "${target-service1.client.uri:}")
public interface TargetServiceClient {

    @RequestMapping(
            value = "/rest/path/1",
            method = RequestMethod.GET,
            produces = {"application/json; charset=UTF-8"}
    )
    Collection<D> getSomething();

    @RequestMapping(
            value = "/rest/path/2",
            method = RequestMethod.GET,
            produces = {"application/json; charset=UTF-8"}
    )
    Collection<D> getSomethingElse();

}
