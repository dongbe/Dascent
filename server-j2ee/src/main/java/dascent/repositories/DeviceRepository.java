package dascent.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import dascent.entities.Device;

public interface DeviceRepository extends MongoRepository<Device, String>{
	
}
