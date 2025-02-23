<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bookmark;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'item_id' => 'required'
        ]);

        $bookmark = Bookmark::updateOrCreate(
            [
                'user_id' => $request->input('user_id'),
                'item_id' => $request->input('item_id'),
            ],
            []
        );

        return response()->json(['success' => true, 'bookmark' => $bookmark]);
    }

    public function destroy()
    {
        return Bookmark::where('user_id',request("user_id"))->where('item_id', request("item_id"))->delete();
    }

    public function show($partnerId)
    {
        return Bookmark::where('user_id', $partnerId)->get();
    }
}
