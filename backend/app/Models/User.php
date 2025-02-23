<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];
    // protected $guarded = {};


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get all of the service_requests for the User
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function service_requests()
    {
        return $this->hasMany(ServiceRequest::class, "partner_id");
    }

    public function client_service_request()
    {
        return $this->belongsTo(User::class, "client_id");
    }

    public function partner_service_request()
    {
        return $this->hasOne(ServiceRequest::class, "partner_id");
    }

    public function isRequest()
    {
        return $this->hasOne(ServiceRequest::class, "client_id");
    }

    public function isBookMarked()
    {
        return $this->hasOne(Bookmark::class,"item_id");
    }
}
