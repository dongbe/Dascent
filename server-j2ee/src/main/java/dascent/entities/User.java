package dascent.entities;

import org.springframework.data.annotation.Id;

public class User {
	
	@Id
	private String id;
	private String name;
	private String lastname;
	private String email;
	private String avatar;
	private String isskey;
	private String idclient;
	private Profile profile;
	private String password;
	private String role;
	private String salt;
	
	public User() {};
	public User(String name,String lastname, String email,String password) {
		this.name = name;
		this.lastname= lastname;
		this.email=email;
		this.password=password;
		this.profile= new Profile();
	}
}
