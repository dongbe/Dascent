package dascent.entities;

import org.springframework.data.annotation.Id;

public class Device {
	@Id
	private String id;
	private String ds_id;
	private String name;
	private String serial;
	private String description;
	private String apikeys;
	private String group;
	private User owner;
	private User constructor;
	private String location;

	
	public Device(){};
	
	public Device(String name,String serial){
		this.name=name;
		this.serial=serial;
	}
	
	 @Override
	    public String toString() {
	        return String.format(
	                "Customer[id=%s, firstName='%s', lastName='%s']",
	                id, name, serial);
	    }

}
