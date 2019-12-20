package de.x.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import de.x.model.z.Z;
import de.x.config.CacheConfiguration;

@FeignClient(value = "target-service2", decode404 = true, url = "${target-service2.client.uri:}")
public interface Service4Client {

    @Cacheable(CacheConfiguration.Z_CACHE_NAME)
    @RequestMapping(method = RequestMethod.GET, value = "/target-service-2/{zc}/")
    public Z resolveZ(@PathVariable("zc") String zc);
}
