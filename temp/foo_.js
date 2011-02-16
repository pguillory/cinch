function square_sum_(a, b) {
    function square_(x) {
        return x * x
    }
    return square_(a) + square_(b) + syncFunc()
}
